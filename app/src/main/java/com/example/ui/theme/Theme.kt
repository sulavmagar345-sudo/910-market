package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = MintPrimary,
    secondary = MintSecondary,
    tertiary = CrimsonAccent,
    background = DeepObsidian,
    surface = DarkGreyCard,
    onPrimary = DeepObsidian,
    onSecondary = DeepObsidian,
    onTertiary = LightSlate,
    onBackground = LightSlate,
    onSurface = LightSlate
)

@Composable
fun PureStreakTheme(
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
