-- 启用 PostGIS 扩展
CREATE EXTENSION IF NOT EXISTS postgis;

-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('student', 'community')),
    student_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 任务表
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    creator_id INTEGER REFERENCES users(id),
    helper_id INTEGER REFERENCES users(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'assigned', 'completed', 'cancelled')),
    postal_code VARCHAR(10) NOT NULL,
    location GEOGRAPHY(POINT) NOT NULL,  -- 存储任务地点的经纬度
    reward DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 任务申请表
CREATE TABLE task_applications (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id),
    applicant_id INTEGER REFERENCES users(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 评价表
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id),
    reviewer_id INTEGER REFERENCES users(id),
    reviewee_id INTEGER REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX tasks_location_idx ON tasks USING GIST (location);
CREATE INDEX tasks_status_idx ON tasks(status);
CREATE INDEX tasks_creator_id_idx ON tasks(creator_id);
CREATE INDEX tasks_helper_id_idx ON tasks(helper_id);
CREATE INDEX task_applications_task_id_idx ON task_applications(task_id);
CREATE INDEX task_applications_applicant_id_idx ON task_applications(applicant_id);
CREATE INDEX reviews_task_id_idx ON reviews(task_id);
CREATE INDEX reviews_reviewer_id_idx ON reviews(reviewer_id);
CREATE INDEX reviews_reviewee_id_idx ON reviews(reviewee_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要自动更新 updated_at 的表添加触发器
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_applications_updated_at
    BEFORE UPDATE ON task_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 添加外键约束
ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_creator
    FOREIGN KEY (creator_id)
    REFERENCES users(id)
    ON DELETE SET NULL;

ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_helper
    FOREIGN KEY (helper_id)
    REFERENCES users(id)
    ON DELETE SET NULL;

ALTER TABLE task_applications
    ADD CONSTRAINT fk_applications_task
    FOREIGN KEY (task_id)
    REFERENCES tasks(id)
    ON DELETE CASCADE;

ALTER TABLE task_applications
    ADD CONSTRAINT fk_applications_applicant
    FOREIGN KEY (applicant_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE reviews
    ADD CONSTRAINT fk_reviews_task
    FOREIGN KEY (task_id)
    REFERENCES tasks(id)
    ON DELETE CASCADE;

ALTER TABLE reviews
    ADD CONSTRAINT fk_reviews_reviewer
    FOREIGN KEY (reviewer_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE reviews
    ADD CONSTRAINT fk_reviews_reviewee
    FOREIGN KEY (reviewee_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

-- 添加唯一约束，防止重复申请
ALTER TABLE task_applications
    ADD CONSTRAINT unique_task_applicant
    UNIQUE (task_id, applicant_id);

-- 添加约束，确保不能给自己的任务评价
ALTER TABLE reviews
    ADD CONSTRAINT check_different_reviewer_reviewee
    CHECK (reviewer_id != reviewee_id);