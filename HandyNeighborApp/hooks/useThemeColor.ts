import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/contexts/ThemeContext'; // ✅ 从 ThemeContext 获取 theme

export function useThemeColor(
    props: { light?: string; dark?: string },
    colorName: keyof typeof Colors.light & keyof typeof Colors.dark
): string {
  const { resolvedTheme } = useThemeContext(); // ✅ 来自上下文，不是系统
  const colorFromProps = props[resolvedTheme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[resolvedTheme][colorName];
  }
}
