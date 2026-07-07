package com.example.ui.components

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.AiState
import com.example.ui.viewmodel.BreathingCycle
import com.example.ui.viewmodel.StreakViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class PureStreakTab {
    DASHBOARD,
    SHIELD,
    JOURNAL,
    PROFILE
}

@Composable
fun MainScreen(
    viewModel: StreakViewModel = viewModel(),
    modifier: Modifier = Modifier
) {
    val profileState by viewModel.streakProfile.collectAsState()
    val elapsedMillis by viewModel.streakElapsedMillis.collectAsState()
    val relapseHistory by viewModel.relapseHistory.collectAsState()
    val journalEntries by viewModel.journalEntries.collectAsState()

    var activeTab by remember { mutableStateOf(PureStreakTab.DASHBOARD) }
    var showRelapseDialog by remember { mutableStateOf(false) }
    var showJournalDialog by remember { mutableStateOf(false) }
    var showUrgeDialog by remember { mutableStateOf(false) }

    val profile = profileState
    val focusManager = LocalFocusManager.current
    val interactionSource = remember { MutableInteractionSource() }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(DeepObsidian)
            .clickable(
                interactionSource = interactionSource,
                indication = null
            ) {
                focusManager.clearFocus()
            }
    ) {
        if (profile == null) {
            // Screen loading state during first initial run
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = MintPrimary)
            }
        } else if (!profile.isOnboarded) {
            // ONBOARDING SCREEN FLOW (Phase 1 & 2)
            OnboardingFlow(
                onOnboardingComplete = { name, age, whyJoin, howSpendTime, hobbies ->
                    viewModel.saveOnboardingProfile(name, age, whyJoin, howSpendTime, hobbies)
                }
            )
        } else if (profile.showAppGuide) {
            // INTERACTIVE WALKTHROUGH APP GUIDE SCREEN
            AppWalkthroughGuide(
                profile = profile,
                onDismiss = { viewModel.completeAppGuide() }
            )
        } else {
            // MAIN APPLICATION INTERFACE
            Scaffold(
                modifier = Modifier.fillMaxSize(),
                bottomBar = {
                    PureStreakBottomNavigation(
                        activeTab = activeTab,
                        onTabSelected = { activeTab = it }
                    )
                },
                containerColor = DeepObsidian
            ) { innerPadding ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                ) {
                    // Ambient radial lighting
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .drawBehind {
                                drawCircle(
                                    brush = Brush.radialGradient(
                                        colors = listOf(MintTertiary.copy(alpha = 0.15f), Color.Transparent),
                                        center = Offset(size.width * 0.5f, size.height * -0.1f)
                                    ),
                                    radius = size.width * 1.3f
                                )
                            }
                    )

                    AnimatedContent(
                        targetState = activeTab,
                        transitionSpec = {
                            fadeIn(animationSpec = spring(stiffness = Spring.StiffnessMediumLow)) togetherWith
                                    fadeOut(animationSpec = spring(stiffness = Spring.StiffnessMediumLow))
                        },
                        label = "ScreenTransition"
                    ) { tab ->
                        when (tab) {
                            PureStreakTab.DASHBOARD -> {
                                DashboardScreen(
                                    profile = profile,
                                    elapsedMillis = elapsedMillis,
                                    relapses = relapseHistory,
                                    viewModel = viewModel,
                                    onRelapseTriggered = { showRelapseDialog = true },
                                    onUrgeTriggered = { showUrgeDialog = true }
                                )
                            }
                            PureStreakTab.SHIELD -> {
                                ShieldScreen(
                                    viewModel = viewModel,
                                    profile = profile
                                )
                            }
                            PureStreakTab.JOURNAL -> {
                                TrackingScreen(
                                    relapses = relapseHistory
                                )
                            }
                            PureStreakTab.PROFILE -> {
                                ProfileScreen(
                                    viewModel = viewModel,
                                    profile = profile,
                                    relapses = relapseHistory
                                )
                            }
                        }
                    }
                }
            }

            // Interactive Slip Confirmatory Dialog
            if (showRelapseDialog) {
                RelapseConfirmDialog(
                    onDismiss = { showRelapseDialog = false },
                    onSubmit = { trigger, notes ->
                        viewModel.logRelapse(trigger, notes)
                        showRelapseDialog = false
                    }
                )
            }

            // Urge Defense Dialog
            if (showUrgeDialog) {
                UrgeDefenseDialog(
                    onDismiss = { showUrgeDialog = false },
                    onSubmit = { trigger, notes ->
                        viewModel.logUrgeResisted(trigger, notes)
                        showUrgeDialog = false
                    }
                )
            }

            // Journal Log Dialog
            if (showJournalDialog) {
                JournalLogDialog(
                    onDismiss = { showJournalDialog = false },
                    onSubmit = { stars, mood, reflection ->
                        viewModel.addJournalEntry(stars, mood, reflection)
                        showJournalDialog = false
                    }
                )
            }
        }
    }
}

// ---------------------------------------------------------------------
// ---- ONBOARDING INTERFACE (PHASE 1 AND 2) ----
// ---------------------------------------------------------------------
@Composable
fun OnboardingFlow(
    onOnboardingComplete: (name: String, age: Int, whyJoin: String, howSpendTime: String, hobbies: String) -> Unit
) {
    var step by remember { mutableStateOf(1) }

    // Onboarding attributes State
    var name by remember { mutableStateOf("") }
    var ageString by remember { mutableStateOf("") }
    var whyJoin by remember { mutableStateOf("") }
    var howSpendTime by remember { mutableStateOf("") }
    var hobbies by remember { mutableStateOf("") }

    var errorText by remember { mutableStateOf("") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // App visual logo
            Icon(
                imageVector = Icons.Default.Shield,
                contentDescription = null,
                tint = MintPrimary,
                modifier = Modifier
                    .size(64.dp)
                    .drawBehind {
                        drawCircle(
                            color = MintPrimary.copy(alpha = 0.15f),
                            radius = size.maxDimension * 0.8f
                        )
                    }
            )
            Spacer(modifier = Modifier.height(24.dp))

            if (step == 1) {
                // PAGE 1: GREETING & NAME & AGE
                Text(
                    text = "Welcome to PureStreak",
                    color = LightSlate,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Black,
                    textAlign = TextAlign.Center
                )
                Text(
                    text = "The extreme willpower arena for self-development.",
                    color = TextGray,
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 8.dp, bottom = 32.dp)
                )

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
                    border = BorderStroke(1.dp, Color.White.copy(alpha = 0.05f))
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text(
                            text = "Build Your Warrior Profile",
                            color = LightSlate,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )

                        OutlinedTextField(
                            value = name,
                            onValueChange = { name = it; errorText = "" },
                            label = { Text("Enter your Warrior Name") },
                            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = MintPrimary) },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = MintPrimary,
                                unfocusedBorderColor = Color.White.copy(alpha = 0.12f),
                                focusedTextColor = LightSlate,
                                unfocusedTextColor = LightSlate
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("onboarding_name_input")
                        )

                        OutlinedTextField(
                            value = ageString,
                            onValueChange = { ageString = it; errorText = "" },
                            label = { Text("Enter your Age") },
                            leadingIcon = { Icon(Icons.Default.Cake, contentDescription = null, tint = MintPrimary) },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = MintPrimary,
                                unfocusedBorderColor = Color.White.copy(alpha = 0.12f),
                                focusedTextColor = LightSlate,
                                unfocusedTextColor = LightSlate
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("onboarding_age_input")
                        )

                        if (errorText.isNotEmpty()) {
                            Text(
                                text = errorText,
                                color = CrimsonAccent,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }

                        Button(
                            onClick = {
                                val parsedAge = ageString.toIntOrNull()
                                if (name.trim().isBlank()) {
                                    errorText = "Warrior name is required to forge your path."
                                } else if (parsedAge == null || parsedAge <= 0) {
                                    errorText = "Please enter a valid age."
                                } else {
                                    errorText = ""
                                    step = 2
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = MintPrimary),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                                .testTag("onboarding_continue_1"),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text(
                                "Forge Ahead",
                                color = DeepObsidian,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                        }
                    }
                }
            } else {
                // PAGE 2: ESSENTIAL ENQUIRIES (WHY JOIN, TIME SPENT, HOBBIES)
                Text(
                    text = "Refining Your Convictions",
                    color = LightSlate,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )
                Text(
                    text = "To stay motivated, we need to locate why you are fighting.",
                    color = TextGray,
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
                )

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
                    border = BorderStroke(1.dp, Color.White.copy(alpha = 0.05f))
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Text(
                            text = "Thought-Provoking Inquiries",
                            color = LightSlate,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )

                        OutlinedTextField(
                            value = whyJoin,
                            onValueChange = { whyJoin = it; if (it.isNotEmpty()) errorText = "" },
                            label = { Text("Why do you want to join/quit?") },
                            placeholder = { Text("e.g. Mental clarity, break addiction, self-mastery") },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = MintPrimary,
                                unfocusedBorderColor = Color.White.copy(alpha = 0.12f),
                                focusedTextColor = LightSlate,
                                unfocusedTextColor = LightSlate
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = howSpendTime,
                            onValueChange = { howSpendTime = it; if (it.isNotEmpty()) errorText = "" },
                            label = { Text("How do you currently spend your time?") },
                            placeholder = { Text("e.g. Studying, gaming, social media, gym") },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = MintPrimary,
                                unfocusedBorderColor = Color.White.copy(alpha = 0.12f),
                                focusedTextColor = LightSlate,
                                unfocusedTextColor = LightSlate
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = hobbies,
                            onValueChange = { hobbies = it; if (it.isNotEmpty()) errorText = "" },
                            label = { Text("What healthy hobbies do you enjoy?") },
                            placeholder = { Text("e.g. Gym, reading, painting, coding") },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = MintPrimary,
                                unfocusedBorderColor = Color.White.copy(alpha = 0.12f),
                                focusedTextColor = LightSlate,
                                unfocusedTextColor = LightSlate
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )

                        if (errorText.isNotEmpty()) {
                            Text(
                                text = errorText,
                                color = CrimsonAccent,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            OutlinedButton(
                                onClick = { step = 1; errorText = "" },
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = LightSlate),
                                border = BorderStroke(1.dp, Color.White.copy(alpha = 0.15f)),
                                modifier = Modifier
                                    .weight(1f)
                                    .height(50.dp),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text("Back")
                            }

                            Button(
                                onClick = {
                                    if (hobbies.trim().isBlank()) {
                                        errorText = "Healthy hobbies are required to customize your offline barrier."
                                    } else {
                                        val cleanedWhy = if (whyJoin.isBlank()) "Improve discipline, increase energy" else whyJoin
                                        val cleanedTime = if (howSpendTime.isBlank()) "Studying and working" else howSpendTime
                                        val cleanedHobbies = hobbies.trim()
                                        
                                        errorText = ""
                                        onOnboardingComplete(
                                            name.trim(),
                                            ageString.toIntOrNull() ?: 18,
                                            cleanedWhy,
                                            cleanedTime,
                                            cleanedHobbies
                                        )
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = MintPrimary),
                                modifier = Modifier
                                    .weight(2f)
                                    .height(50.dp)
                                    .testTag("onboarding_complete_2"),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text("Build My Shield", color = DeepObsidian, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------------
// ---- APP WALKTHROUGH GUIDE SCREEN ----
// ---------------------------------------------------------------------
@Composable
fun AppWalkthroughGuide(
    profile: StreakEntity,
    onDismiss: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Character Badge Container
            Box(
                modifier = Modifier
                    .size(90.dp)
                    .background(MintSecondary.copy(alpha = 0.1f), CircleShape)
                    .border(1.5.dp, MintPrimary, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.FitnessCenter,
                    contentDescription = null,
                    tint = MintPrimary,
                    modifier = Modifier.size(40.dp)
                )
            }
            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Coach Jack - Physical Path",
                color = LightSlate,
                fontSize = 22.sp,
                fontWeight = FontWeight.Black,
                textAlign = TextAlign.Center
            )
            Text(
                text = "GUARDIAN OF PHYSIC COMPOSURE",
                color = MintPrimary,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Speech Bubble
            Card(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp),
                colors = CardDefaults.cardColors(containerColor = MintSecondary.copy(alpha = 0.05f)),
                border = BorderStroke(0.5.dp, MintPrimary.copy(alpha = 0.2f))
            ) {
                Text(
                    text = "\"Welcome, ${profile.warriorName}! True brain healing is built on strict physical behaviors, not just mental wishing. To prevent relapses, follow these guidelines to the letter!\"",
                    color = LightSlate,
                    fontSize = 12.sp,
                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                    lineHeight = 16.sp,
                    modifier = Modifier.padding(14.dp),
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
                border = BorderStroke(1.dp, Color.White.copy(alpha = 0.05f))
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.Start,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    GuideStepItem(
                        icon = Icons.Default.DirectionsRun,
                        title = "1. Drop & Do 20 Pushups",
                        description = "When high-dopamine cravings strike, hit the floor instantly. Squeezing primary muscle groups redirects blood circulation physically, resetting the impulse loop."
                    )

                    GuideStepItem(
                        icon = Icons.Default.PhonelinkOff,
                        title = "2. Phone-Free Zones",
                        description = "Enforce physical distance. Your smartphone is prohibited in bathroom areas and your sleeping chambers. Boundaries eliminate 90% of failures."
                    )

                    GuideStepItem(
                        icon = Icons.Default.Bolt,
                        title = "3. Shock Your Senses",
                        description = "Splash ice-cold water onto your face or step into a freezing shower for 60 seconds. Sensory shock re-anchors attention instantly."
                    )

                    GuideStepItem(
                        icon = Icons.Default.Build,
                        title = "4. Force Energy into Hobbies",
                        description = "Channel raw urge energy directly into constructing real habits: ${profile.hobbies}. Build instead of caving."
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Button(
                        onClick = onDismiss,
                        colors = ButtonDefaults.buttonColors(containerColor = MintPrimary),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                            .testTag("dismiss_app_guide_btn"),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text(
                            "I COMMIT TO THE CODE",
                            color = DeepObsidian,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun GuideStepItem(
    icon: ImageVector,
    title: String,
    description: String
) {
    Row(
        verticalAlignment = Alignment.Top,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = MintPrimary,
            modifier = Modifier
                .size(24.dp)
                .padding(top = 2.dp)
        )
        Column {
            Text(
                text = title,
                color = LightSlate,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = description,
                color = TextGray,
                fontSize = 12.sp,
                lineHeight = 16.sp
            )
        }
    }
}

// ---- NAVIGATION BAR SETUP ----
@Composable
fun PureStreakBottomNavigation(
    activeTab: PureStreakTab,
    onTabSelected: (PureStreakTab) -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .windowInsetsPadding(WindowInsets.navigationBars),
        color = DeepObsidian,
        tonalElevation = 8.dp,
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.05f))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            NavigationItem(
                icon = Icons.Default.LocalFireDepartment,
                label = "Dashboard",
                active = activeTab == PureStreakTab.DASHBOARD,
                onClick = { onTabSelected(PureStreakTab.DASHBOARD) },
                testTag = "nav_dashboard"
            )
            NavigationItem(
                icon = Icons.Default.Shield,
                label = "Urge Shield",
                active = activeTab == PureStreakTab.SHIELD,
                onClick = { onTabSelected(PureStreakTab.SHIELD) },
                testTag = "nav_shield"
            )
            NavigationItem(
                icon = Icons.Default.History,
                label = "Tracking",
                active = activeTab == PureStreakTab.JOURNAL,
                onClick = { onTabSelected(PureStreakTab.JOURNAL) },
                testTag = "nav_journal"
            )
            NavigationItem(
                icon = Icons.Default.Person,
                label = "Warrior info",
                active = activeTab == PureStreakTab.PROFILE,
                onClick = { onTabSelected(PureStreakTab.PROFILE) },
                testTag = "nav_profile"
            )
        }
    }
}

@Composable
fun NavigationItem(
    icon: ImageVector,
    label: String,
    active: Boolean,
    onClick: () -> Unit,
    testTag: String,
    modifier: Modifier = Modifier
) {
    val activeColor = MintPrimary
    val inactiveColor = TextGray
    val scale by animateFloatAsState(targetValue = if (active) 1.12f else 1.0f)
    val glowColor = if (active) activeColor.copy(alpha = 0.12f) else Color.Transparent

    Column(
        modifier = modifier
            .testTag(testTag)
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .drawBehind {
                    drawCircle(color = glowColor, radius = size.maxDimension * 0.7f)
                }
                .padding(4.dp),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = if (active) activeColor else inactiveColor,
                modifier = Modifier.size(24.dp * scale)
            )
        }
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = label,
            color = if (active) activeColor else inactiveColor,
            fontSize = 11.sp,
            fontWeight = if (active) FontWeight.Bold else FontWeight.Medium,
            fontFamily = FontFamily.SansSerif
        )
    }
}

// ----------------------------------------------------
// ---- TAB 1: THE WILLPOWER DASHBOARD ----
// ----------------------------------------------------
@Composable
fun DashboardScreen(
    profile: StreakEntity,
    elapsedMillis: Long,
    relapses: List<RelapseRecord>,
    viewModel: StreakViewModel,
    onRelapseTriggered: () -> Unit,
    onUrgeTriggered: () -> Unit
) {
    val dailyQuote by viewModel.dailyWelcomeQuote.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 18.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        contentPadding = PaddingValues(top = 24.dp, bottom = 48.dp)
    ) {
        // Welcoming Greeting Row
        item {
            Text(
                text = "${profile.warriorName}'s Arena",
                color = LightSlate,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.SansSerif,
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Start
            )
            Text(
                text = "Rank: ${profile.warriorRank}",
                color = MintPrimary,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 2.dp, bottom = 20.dp),
                textAlign = TextAlign.Start
            )
        }

        // Fresh dynamic quote banner - highlighted and styled beautifully
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 20.dp),
                colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
                border = BorderStroke(
                    width = 1.5.dp,
                    brush = Brush.linearGradient(
                        colors = listOf(MintPrimary, MintSecondary)
                    )
                )
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocalFireDepartment,
                            contentDescription = null,
                            tint = MintPrimary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "⚡ TODAY'S WARRIOR CONVICTION",
                            color = MintPrimary,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 1.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.FormatQuote,
                            contentDescription = null,
                            tint = MintSecondary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = dailyQuote,
                            color = LightSlate,
                            fontSize = 12.sp,
                            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                            lineHeight = 16.sp
                        )
                    }
                }
            }
        }

        // Ticking Stopwatch Progress Circle
        item {
            StreakStopwatchRing(
                elapsedMillis = elapsedMillis,
                targetDays = profile.levelThresholdDays,
                activeChallengeHours = profile.activeChallengeHours
            )
            Spacer(modifier = Modifier.height(20.dp))
        }

        // EMERGENCY DEFENSE AND RESET CONTROL HUB (SIDE-BY-SIDE CONTROLS)
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 24.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // I Feel an Urge Button (Defence victory)
                Button(
                    onClick = onUrgeTriggered,
                    colors = ButtonDefaults.buttonColors(containerColor = MintTertiary.copy(alpha = 0.25f)),
                    border = BorderStroke(1.2.dp, MintPrimary.copy(alpha = 0.8f)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .weight(1.2f)
                        .height(52.dp)
                        .testTag("log_refuse_urge_btn")
                ) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = null,
                        tint = MintPrimary,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "I Feel an Urge",
                        color = MintPrimary,
                        fontWeight = FontWeight.Black,
                        fontSize = 12.sp
                    )
                }

                // I Slipped Up Button (Loss resetting)
                Button(
                    onClick = onRelapseTriggered,
                    colors = ButtonDefaults.buttonColors(containerColor = CrimsonDark.copy(alpha = 0.25f)),
                    border = BorderStroke(1.2.dp, CrimsonAccent.copy(alpha = 0.8f)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(52.dp)
                        .testTag("reset_streak_btn")
                ) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = null,
                        tint = CrimsonAccent,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "I Slipped Up",
                        color = CrimsonAccent,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }
        }

        // Stats Dashboard Card
        item {
            DashboardStats(
                elapsedMillis = elapsedMillis, 
                longest = profile.longestStreakMillis, 
                relapseCount = relapses.size
            )
            Spacer(modifier = Modifier.height(20.dp))
        }

        // TACTICAL DISCIPLINE CHALLENGES SYSTEM (Start challenge)
        item {
            ActiveChallengesWidget(
                profile = profile,
                viewModel = viewModel
            )
            Spacer(modifier = Modifier.height(20.dp))
        }

        // MALE-TARGETED COGNITIVE DISTRACTION SHIELDS CONTENT FILTERS
        item {
            TargetedContentFiltersCard(
                profile = profile,
                viewModel = viewModel
            )
            Spacer(modifier = Modifier.height(20.dp))
        }

        // Reasons board
        item {
            WarriorQuitReasonsCard(reasons = profile.quitReasons)
        }
    }
}

@Composable
fun StreakStopwatchRing(
    elapsedMillis: Long,
    targetDays: Int,
    activeChallengeHours: Int,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseSize by infiniteTransition.animateFloat(
        initialValue = 0.98f,
        targetValue = 1.02f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "radial"
    )

    // Countdown details
    val days = elapsedMillis / (1000 * 60 * 60 * 24)
    val hours = (elapsedMillis / (1000 * 60 * 60)) % 24
    val minutes = (elapsedMillis / (1000 * 60)) % 60
    val seconds = (elapsedMillis / 1000) % 60

    val progressDegrees = remember(elapsedMillis, targetDays) {
        val totalSeconds = targetDays * 24 * 60 * 60L
        val passedSeconds = elapsedMillis / 1000L
        if (totalSeconds <= 0) 0.05f else (passedSeconds.toFloat() / totalSeconds.toFloat()).coerceIn(0.01f, 1.0f)
    }

    Box(
        modifier = modifier
            .size(240.dp)
            .padding(10.dp),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .drawBehind {
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                MintSecondary.copy(alpha = 0.05f * pulseSize),
                                Color.Transparent
                            )
                        )
                    )
                }
        )

        Canvas(modifier = Modifier.fillMaxSize()) {
            val strokeWidth = 10.dp.toPx()
            val arcSize = size / 1.15f
            val offsetLeft = (size.width - arcSize.width) / 2
            val offsetTop = (size.height - arcSize.height) / 2

            // Base track progress background
            drawArc(
                color = DarkGreyCard,
                startAngle = 0f,
                sweepAngle = 360f,
                useCenter = false,
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round),
                size = arcSize,
                topLeft = Offset(offsetLeft, offsetTop)
            )

            // Dynamic progress arc (glowing progress indicator)
            drawArc(
                brush = Brush.sweepGradient(
                    0f to MintTertiary,
                    0.5f to MintSecondary,
                    1f to MintPrimary
                ),
                startAngle = -90f,
                sweepAngle = progressDegrees * 360f,
                useCenter = false,
                style = Stroke(width = strokeWidth + 2.dp.toPx(), cap = StrokeCap.Round),
                size = arcSize,
                topLeft = Offset(offsetLeft, offsetTop)
            )
        }

        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Default.LocalFireDepartment,
                contentDescription = null,
                tint = MintPrimary,
                modifier = Modifier
                    .size(34.dp)
                    .drawBehind {
                        drawCircle(
                            color = MintPrimary.copy(alpha = 0.12f),
                            radius = size.maxDimension * 0.75f
                        )
                    }
            )
            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = String.format("%02d", days),
                color = LightSlate,
                fontSize = 52.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace,
                lineHeight = 52.sp
            )
            Text(
                text = if (days == 1L) "DAY RESOLVE" else "DAYS RESOLVE",
                color = MintPrimary,
                fontSize = 9.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.5.sp
            )
            Spacer(modifier = Modifier.height(10.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                CompactTimeBlock(value = hours, text = "H")
                Text(":", color = TextGray, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                CompactTimeBlock(value = minutes, text = "M")
                Text(":", color = TextGray, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                CompactTimeBlock(value = seconds, text = "S", highlight = true)
            }

            if (activeChallengeHours > 0) {
                Spacer(modifier = Modifier.height(8.dp))
                Box(
                    modifier = Modifier
                        .background(MintPrimary.copy(alpha = 0.15f), RoundedCornerShape(100.dp))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = "⚡ CHALLENGE ACTIVE: ${activeChallengeHours}H",
                        color = MintPrimary,
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            } else {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "${(progressDegrees * 100).toInt()}% of $targetDays-Day Master Milestone",
                    color = TextGray,
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun CompactTimeBlock(
    value: Long,
    text: String,
    highlight: Boolean = false
) {
    Row(
        modifier = Modifier
            .background(DarkGreyCard.copy(alpha = 0.8f), RoundedCornerShape(4.dp))
            .padding(horizontal = 4.dp, vertical = 2.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = String.format("%02d", value),
            color = if (highlight) MintPrimary else LightSlate,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace
        )
        Spacer(modifier = Modifier.width(2.dp))
        Text(
            text = text,
            color = TextGray,
            fontSize = 9.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
fun DashboardStats(
    elapsedMillis: Long,
    longest: Long,
    relapseCount: Int
) {
    val hrsGained = (elapsedMillis.toFloat() / (1000f * 60 * 60))
    val longestDays = longest / (1000 * 60 * 60 * 24)

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        StatPill(
            modifier = Modifier.weight(1f),
            label = "Longest Streak",
            value = if (longestDays == 1L) "1 Day" else "$longestDays Days",
            icon = Icons.Default.EmojiEvents,
            tint = YellowAccent
        )
        StatPill(
            modifier = Modifier.weight(1f),
            label = "Focus Gained",
            value = String.format("%.1f Hrs", hrsGained),
            icon = Icons.Default.Bolt,
            tint = MintPrimary
        )
        StatPill(
            modifier = Modifier.weight(1f),
            label = "Slip Resets",
            value = "$relapseCount",
            icon = Icons.Default.TrendingDown,
            tint = CrimsonAccent
        )
    }
}

@Composable
fun StatPill(
    label: String,
    value: String,
    icon: ImageVector,
    tint: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.04f))
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = tint, modifier = Modifier.size(16.dp))
            Text(text = label, color = TextGray, fontSize = 10.sp, fontWeight = FontWeight.Medium)
            Text(text = value, color = LightSlate, fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }
    }
}

// ---- TACTICAL ACTIVE CHALLENGES INTERFACE ----
@Composable
fun ActiveChallengesWidget(
    profile: StreakEntity,
    viewModel: StreakViewModel
) {
    val challengeSecondsLeft by viewModel.challengeRemainingSeconds.collectAsState()
    val challengeProgress by viewModel.challengeProgress.collectAsState()

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
        border = BorderStroke(1.dp, if (profile.activeChallengeHours > 0) MintPrimary.copy(alpha = 0.3f) else Color.White.copy(alpha = 0.05f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.MilitaryTech,
                    contentDescription = null,
                    tint = MintPrimary,
                    modifier = Modifier.size(22.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Tactical Willpower Challenges",
                    color = LightSlate,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Text(
                text = "Engage in timed lock-down challenges to upgrade your rank.",
                color = TextGray,
                fontSize = 11.sp,
                modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
            )

            if (profile.activeChallengeHours == 0) {
                // EXCITING CHALLENGE OPTIONS
                Column(
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Challenge 1: 24 Hours
                    ChallengeEnrollRow(
                        hoursLabel = "24-Hour Crucible",
                        desc = "Establish complete brain rest for an entire day.",
                        completed = profile.challengeCompleted24h,
                        onStart = { viewModel.startChallenge(24) }
                    )

                    // Challenge 2: 28 Hours
                    ChallengeEnrollRow(
                        hoursLabel = "28-Hour Composure",
                        desc = "Reset your cognitive limits inside a 28-hr shell.",
                        completed = profile.challengeCompleted28h,
                        onStart = { viewModel.startChallenge(28) }
                    )

                    // Challenge 3: 48 Hours ELITE (unlocked after 24h completes!)
                    val unlocked = profile.challengeCompleted24h
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                color = if (unlocked) Color.Transparent else Color.Black.copy(alpha = 0.3f),
                                shape = RoundedCornerShape(8.dp)
                            )
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(modifier = Modifier.weight(1f)) {
                            ChallengeEnrollRow(
                                hoursLabel = "48-Hour Unbreakable (Elite)",
                                desc = "A multi-day trial of superior character. Requires 24-hr unlock.",
                                completed = profile.challengeCompleted48h,
                                locked = !unlocked,
                                onStart = { viewModel.startChallenge(48) }
                            )
                        }
                    }
                }
            } else {
                // CHALLENGE ACTIVE PROGRESS REPORT
                val hoursRem = challengeSecondsLeft / 3600
                val minsRem = (challengeSecondsLeft / 60) % 60
                val secsRem = challengeSecondsLeft % 60

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(DeepObsidian.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                        .padding(14.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Active Trial: ${profile.activeChallengeHours} Hours",
                        color = LightSlate,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    if (challengeSecondsLeft > 0) {
                        // Progress bar & countdown
                        LinearProgressIndicator(
                            progress = { challengeProgress },
                            color = MintPrimary,
                            trackColor = Color.White.copy(alpha = 0.1f),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = String.format("Time Remaining: %02d:%02d:%02d", hoursRem, minsRem, secsRem),
                            color = MintPrimary,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        TextButton(
                            onClick = { viewModel.abandonActiveChallenge() }
                        ) {
                            Text("Abandon Challenge", color = CrimsonAccent, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    } else {
                        // SUCCESSFUL CHALLENGE CONQUERED!
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(MintSecondary.copy(alpha = 0.15f), RoundedCornerShape(8.dp))
                                .border(1.dp, MintPrimary, RoundedCornerShape(8.dp))
                                .padding(12.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "🔥 VICTORY SECURED! 🔥",
                                    color = MintPrimary,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Black
                                )
                                Text(
                                    text = "You didn't break. Claim your rank upgrade now!",
                                    color = LightSlate,
                                    fontSize = 11.sp,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(top = 2.dp, bottom = 8.dp)
                                )
                                Button(
                                    onClick = { viewModel.claimCompletedChallengeReward() },
                                    colors = ButtonDefaults.buttonColors(containerColor = MintPrimary),
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier.testTag("claim_challenge_btn")
                                ) {
                                    Text("Claim Rank Upgrade", color = DeepObsidian, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ChallengeEnrollRow(
    hoursLabel: String,
    desc: String,
    completed: Boolean,
    locked: Boolean = false,
    onStart: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = DeepObsidian.copy(alpha = 0.4f)),
        border = BorderStroke(0.5.dp, Color.White.copy(alpha = 0.04f))
    ) {
        Row(
            modifier = Modifier.padding(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = hoursLabel,
                        color = if (locked) TextGray else LightSlate,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                    if (completed) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Completed",
                            tint = MintPrimary,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                    if (locked) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(
                            imageVector = Icons.Outlined.Lock,
                            contentDescription = "Locked",
                            tint = TextGray,
                            modifier = Modifier.size(13.dp)
                        )
                    }
                }
                Text(
                    text = desc,
                    color = TextGray,
                    fontSize = 10.sp,
                    lineHeight = 14.sp,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            Button(
                onClick = onStart,
                enabled = !locked,
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (completed) MintTertiary else MintPrimary,
                    disabledContainerColor = Color.White.copy(alpha = 0.05f)
                ),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                shape = RoundedCornerShape(6.dp),
                modifier = Modifier
                    .height(34.dp)
                    .testTag("start_challenge_btn_" + hoursLabel.take(2))
            ) {
                Text(
                    text = if (completed) "Retry" else "Start",
                    color = if (completed) MintPrimary else DeepObsidian,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

// ---- MALE-TARGETED DIGITAL DISTRACTION FILTERS ----
@Composable
fun TargetedContentFiltersCard(
    profile: StreakEntity,
    viewModel: StreakViewModel
) {
    var blockAdult by remember(profile) { mutableStateOf(profile.blockAdultSensory) }
    var blockLateDoom by remember(profile) { mutableStateOf(profile.blockLateNightDoomscroll) }
    var silencWords by remember(profile) { mutableStateOf(profile.silencerTriggerWords) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.05f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.FilterAlt,
                    contentDescription = null,
                    tint = MintPrimary,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Anti-Distraction Shield Filters",
                    color = LightSlate,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Text(
                text = "Actively block digital triggers to bypass dangerous late-night urges.",
                color = TextGray,
                fontSize = 11.sp,
                modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
            )

            // Filter row 1
            TriggerFilterRow(
                title = "Filter Adult Cues & Hints",
                desc = "Filters subtle suggestive clickbait across web feeds.",
                checked = blockAdult,
                onCheckedChange = {
                    blockAdult = it
                    viewModel.saveDistractionFilters(it, blockLateDoom, silencWords)
                }
            )

            HorizontalDivider(color = Color.White.copy(alpha = 0.05f), modifier = Modifier.padding(vertical = 4.dp))

            // Filter row 2
            TriggerFilterRow(
                title = "No Late Night High Dopamine",
                desc = "Silences doomscrolling triggers after 10 PM.",
                checked = blockLateDoom,
                onCheckedChange = {
                    blockLateDoom = it
                    viewModel.saveDistractionFilters(blockAdult, it, silencWords)
                }
            )

            HorizontalDivider(color = Color.White.copy(alpha = 0.05f), modifier = Modifier.padding(vertical = 4.dp))

            // Filter row 3
            TriggerFilterRow(
                title = "Silencer Trigger Keywords",
                desc = "Intercepts specific words in community or search pages.",
                checked = silencWords,
                onCheckedChange = {
                    silencWords = it
                    viewModel.saveDistractionFilters(blockAdult, blockLateDoom, it)
                }
            )
        }
    }
}

@Composable
fun TriggerFilterRow(
    title: String,
    desc: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                color = LightSlate,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = desc,
                color = TextGray,
                fontSize = 9.sp,
                lineHeight = 12.sp,
                modifier = Modifier.padding(top = 1.dp)
            )
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = DeepObsidian,
                checkedTrackColor = MintPrimary,
                uncheckedThumbColor = TextGray,
                uncheckedTrackColor = DeepObsidian
            ),
            modifier = Modifier.scale(0.8f)
        )
    }
}

@Composable
fun WarriorQuitReasonsCard(reasons: String) {
    val items = remember(reasons) {
        reasons.split(",").map { it.trim() }.filter { it.isNotEmpty() }
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.05f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Pillars of Resolve",
                color = LightSlate,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            items.forEach { r ->
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(vertical = 3.dp)
                ) {
                    Box(modifier = Modifier.size(5.dp).background(MintPrimary, CircleShape))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = r, color = LightSlate, fontSize = 12.sp)
                }
            }
        }
    }
}
 // ---------------------------------------------------------------------
// ---- TAB 2: COPE ACTIONS SCREEN ("I FEEL AN URGE" BUTTON + BREATHING) ----
// ---------------------------------------------------------------------
@Composable
fun ShieldScreen(
    viewModel: StreakViewModel,
    profile: StreakEntity
) {
    val breathingCycle by viewModel.breathingState.collectAsState()
    val secondsLeft by viewModel.breathingSecondsLeft.collectAsState()
    val aiState by viewModel.aiMotivationState.collectAsState()

    var showCopeStrategies by remember { mutableStateOf(false) }
    var selectedStrategies by remember { mutableStateOf(setOf<Int>()) }
    var showStrategySuccessMessage by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 18.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        contentPadding = PaddingValues(top = 24.dp, bottom = 80.dp)
    ) {
        // Aesthetic Title Block
        item {
            Text(
                text = "The Composure Shield",
                color = LightSlate,
                fontSize = 24.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.SansSerif,
                modifier = Modifier.fillMaxWidth(),
                letterSpacing = (-0.5).sp
            )
            Spacer(modifier = Modifier.height(4.dp))
        }

        // PHYSICAL SHIELD EXPLANATION BLOCK - "The Content Block clearly defining how it works and its purpose"
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 20.dp),
                colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
                border = BorderStroke(1.dp, MintPrimary.copy(alpha = 0.25f))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "🛡️ SHIELD ACTION BLUEPRINT",
                        color = MintPrimary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "PURPOSE & FUNCTION",
                        color = LightSlate,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Highly active urges operate on localized dopamine loops. The Composure Shield is built to physically disrupt, redirect, and neutralize these compulsive override spikes instantly.",
                        color = TextGray,
                        fontSize = 10.5.sp,
                        lineHeight = 15.sp,
                        modifier = Modifier.padding(top = 2.dp, bottom = 10.dp)
                    )
                    
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(Color.White.copy(alpha = 0.08f))
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    
                    Text(
                        text = "ACTIVATE CORE IN 3 STEPS:",
                        color = LightSlate,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.5.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    
                    // Step item 1
                    Row(verticalAlignment = Alignment.Top, modifier = Modifier.padding(bottom = 4.dp)) {
                        Text("1.", color = MintPrimary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Initiate the Zen rhythmic breathing cycle below to restore logic-circuit oxygen.", color = TextGray, fontSize = 10.sp, lineHeight = 14.sp)
                    }
                    // Step item 2
                    Row(verticalAlignment = Alignment.Top, modifier = Modifier.padding(bottom = 4.dp)) {
                        Text("2.", color = MintPrimary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Choose 2 Cold physical intercepts to redirect regional biological flow.", color = TextGray, fontSize = 10.sp, lineHeight = 14.sp)
                    }
                    // Step item 3
                    Row(verticalAlignment = Alignment.Top) {
                        Text("3.", color = MintPrimary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Invoke Gemini companion wisdom to restructure negative thoughts immediately.", color = TextGray, fontSize = 10.sp, lineHeight = 14.sp)
                    }
                }
            }
        }

        // ZEN BOX BREATHING TIMERS COMPONENT (Zen Centerpiece)
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 20.dp),
                colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
                border = BorderStroke(1.dp, if (breathingCycle != BreathingCycle.IDLE) MintPrimary.copy(alpha = 0.4f) else Color.White.copy(alpha = 0.04f))
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Rhythmic Box Breathing",
                            color = LightSlate,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Box(
                            modifier = Modifier
                                .background(if (breathingCycle != BreathingCycle.IDLE) MintPrimary.copy(alpha = 0.15f) else Color.White.copy(alpha = 0.05f), RoundedCornerShape(6.dp))
                                .padding(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = if (breathingCycle != BreathingCycle.IDLE) "ACTIVE" else "STANDBY",
                                color = if (breathingCycle != BreathingCycle.IDLE) MintPrimary else TextGray,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Text(
                        text = "Calms erratic heart rates to break core anxiety spikes.",
                        color = TextGray,
                        fontSize = 11.sp,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 1.dp, bottom = 16.dp)
                    )

                    // Minimal Pulse breathing circle graphics
                    Box(
                        modifier = Modifier
                            .size(150.dp)
                            .padding(6.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        val ringPulse by animateFloatAsState(
                            targetValue = when (breathingCycle) {
                                BreathingCycle.INHALE -> 1.35f
                                BreathingCycle.HOLD_IN -> 1.35f
                                BreathingCycle.EXHALE -> 0.85f
                                BreathingCycle.HOLD_OUT -> 0.75f
                                BreathingCycle.IDLE -> 1.0f
                            },
                            animationSpec = tween(4000, easing = LinearEasing),
                            label = "ringPulse"
                        )

                        Box(
                            modifier = Modifier
                                .size(80.dp * ringPulse)
                                .background(
                                    brush = Brush.radialGradient(
                                        colors = listOf(
                                            (if (breathingCycle != BreathingCycle.IDLE) MintPrimary else TextGray).copy(alpha = 0.16f),
                                            Color.Transparent
                                        )
                                    ),
                                    shape = CircleShape
                                )
                        )

                        Canvas(modifier = Modifier.size(100.dp)) {
                            drawCircle(
                                color = if (breathingCycle != BreathingCycle.IDLE) MintPrimary else Color.White.copy(alpha = 0.05f),
                                radius = size.minDimension / 2f * ringPulse,
                                style = Stroke(width = 3.dp.toPx())
                            )
                        }

                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = if (breathingCycle != BreathingCycle.IDLE) "$secondsLeft" else "💨",
                                color = if (breathingCycle != BreathingCycle.IDLE) MintPrimary else LightSlate,
                                fontSize = if (breathingCycle != BreathingCycle.IDLE) 30.sp else 22.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                            if (breathingCycle != BreathingCycle.IDLE) {
                                Text(
                                    text = breathingCycle.label,
                                    color = LightSlate,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Black,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = {
                            if (breathingCycle == BreathingCycle.IDLE) {
                                viewModel.startBreathingExercise()
                            } else {
                                viewModel.stopBreathingExercise()
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (breathingCycle == BreathingCycle.IDLE) MintPrimary else CrimsonDark
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                            .testTag("shield_breathing_btn"),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text(
                            text = breathingCycle.actionText,
                            fontWeight = FontWeight.Bold,
                            color = if (breathingCycle == BreathingCycle.IDLE) DeepObsidian else LightSlate,
                            fontSize = 13.sp
                        )
                    }
                }
            }
        }

        // PHYSICAL INTERCEPS EXPANDABLE PANEL
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp)
                    .clickable {
                        showCopeStrategies = !showCopeStrategies
                        if (showCopeStrategies) {
                            showStrategySuccessMessage = false
                            selectedStrategies = emptySet()
                        }
                    },
                colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
                border = BorderStroke(1.dp, if (showCopeStrategies) CrimsonAccent.copy(alpha = 0.3f) else Color.White.copy(alpha = 0.04f))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = null,
                            tint = CrimsonAccent,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Emergency Physical Intercepts",
                                color = LightSlate,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Instant biological shock-redirects",
                                color = TextGray,
                                fontSize = 10.sp
                            )
                        }
                    }
                    Icon(
                        imageVector = if (showCopeStrategies) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                        contentDescription = null,
                        tint = TextGray,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }

        // COPING CHECKLIST (ONLY SHOWN WHEN EXPANDED)
        if (showCopeStrategies) {
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 20.dp),
                    colors = CardDefaults.cardColors(containerColor = DeepObsidian.copy(alpha = 0.4f)),
                    border = BorderStroke(1.dp, CrimsonAccent.copy(alpha = 0.25f))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(
                            text = "Select 2 strategies to perform physically right now:",
                            color = LightSlate,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(bottom = 10.dp)
                        )

                        CopingSelectionRow(
                            id = 1,
                            title = "Cold Facial Intercept",
                            desc = "Splash ice-cold water onto your face for 30s to trigger mammalian dive reflexes.",
                            selected = selectedStrategies.contains(1),
                            onToggle = { id ->
                                selectedStrategies = if (selectedStrategies.contains(id)) selectedStrategies - id else selectedStrategies + id
                            }
                        )

                        CopingSelectionRow(
                            id = 2,
                            title = "20 Squats / Pushups Blast",
                            desc = "Redirect blood flow from pelvic regions into burning motor muscle groups.",
                            selected = selectedStrategies.contains(2),
                            onToggle = { id ->
                                selectedStrategies = if (selectedStrategies.contains(id)) selectedStrategies - id else selectedStrategies + id
                            }
                        )

                        CopingSelectionRow(
                            id = 3,
                            title = "Physiological Double-Sigh",
                            desc = "Double deep nasal inhale, followed by a long slower sighing mouth exhalation.",
                            selected = selectedStrategies.contains(3),
                            onToggle = { id ->
                                selectedStrategies = if (selectedStrategies.contains(id)) selectedStrategies - id else selectedStrategies + id
                            }
                        )

                        CopingSelectionRow(
                            id = 4,
                            title = "Physical Isolation Intercept",
                            desc = "Shutdown your phone and step outside from the room for exactly 5 minutes.",
                            selected = selectedStrategies.contains(4),
                            onToggle = { id ->
                                selectedStrategies = if (selectedStrategies.contains(id)) selectedStrategies - id else selectedStrategies + id
                            }
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Button(
                            onClick = {
                                if (selectedStrategies.size == 2) {
                                    showStrategySuccessMessage = true
                                    showCopeStrategies = false
                                }
                            },
                            enabled = selectedStrategies.size == 2,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MintPrimary,
                                disabledContainerColor = Color.White.copy(alpha = 0.05f)
                            ),
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                "Lock in Complete Routine", 
                                color = if (selectedStrategies.size == 2) DeepObsidian else TextGray, 
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }
                    }
                }
            }
        }

        // ROUTINE LOCKED MESSAGE
        if (showStrategySuccessMessage) {
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 20.dp),
                    colors = CardDefaults.cardColors(containerColor = MintSecondary.copy(alpha = 0.1f)),
                    border = BorderStroke(1.dp, MintPrimary)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "🛡️ Routines Locked in Place",
                            color = MintPrimary,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Go execute those 2 physical activities right now. Set aside screens. Control your focus. You are unbeatable.",
                            color = LightSlate,
                            fontSize = 11.sp,
                            textAlign = TextAlign.Center,
                            lineHeight = 15.sp,
                            modifier = Modifier.padding(bottom = 12.dp)
                        )
                        Button(
                            onClick = { showStrategySuccessMessage = false },
                            colors = ButtonDefaults.buttonColors(containerColor = MintPrimary),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Text("I am Ready", color = DeepObsidian, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                        }
                    }
                }
            }
        }

        // EMERGENCY GEMINI AI SECURE COMPANION
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
                border = BorderStroke(1.dp, Color.White.copy(alpha = 0.04f))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Psychology,
                            contentDescription = null,
                            tint = MintPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Companion AI Reframing Advice",
                                color = LightSlate,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Empowered companion logic against urges",
                                color = TextGray,
                                fontSize = 10.sp
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(14.dp))

                    when (val state = aiState) {
                        is AiState.Idle -> {
                            Button(
                                onClick = {
                                    viewModel.requestAiBoost(
                                        trigger = "Immediate urge triggered by internet triggers",
                                        urgeStrength = "4"
                                    )
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = MintSecondary.copy(alpha = 0.08f)),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .border(1.dp, MintPrimary.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                                    .testTag("request_ai_boost_btn")
                            ) {
                                Icon(Icons.Default.OfflineBolt, contentDescription = null, tint = MintPrimary, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Summon Gemini AI Counselor", color = MintPrimary, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                        }
                        is AiState.Loading -> {
                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                CircularProgressIndicator(color = MintPrimary, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                                Spacer(modifier = Modifier.height(6.dp))
                                Text("Synthesizing tough discipline guidance...", color = TextGray, fontSize = 10.sp)
                            }
                        }
                        is AiState.Success -> {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(DeepObsidian, RoundedCornerShape(8.dp))
                                    .padding(12.dp)
                            ) {
                                Text(
                                    text = state.quote,
                                    color = LightSlate,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                                    lineHeight = 16.sp
                                )
                                Spacer(modifier = Modifier.height(10.dp))
                                TextButton(
                                    onClick = { viewModel.clearAiState() },
                                    modifier = Modifier.align(Alignment.End)
                                ) {
                                    Text("Acknowledge Guidance", color = MintPrimary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CopingSelectionRow(
    id: Int,
    title: String,
    desc: String,
    selected: Boolean,
    onToggle: (Int) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clickable { onToggle(id) },
        colors = CardDefaults.cardColors(
            containerColor = if (selected) MintSecondary.copy(alpha = 0.1f) else DeepObsidian.copy(alpha = 0.3f)
        ),
        border = BorderStroke(1.dp, if (selected) MintPrimary.copy(alpha = 0.4f) else Color.White.copy(alpha = 0.04f))
    ) {
        Row(
            modifier = Modifier.padding(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    color = if (selected) MintPrimary else LightSlate,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = desc,
                    color = TextGray,
                    fontSize = 9.sp,
                    lineHeight = 12.sp,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
            Checkbox(
                checked = selected,
                onCheckedChange = { onToggle(id) },
                colors = CheckboxDefaults.colors(checkedColor = MintPrimary, uncheckedColor = TextGray)
            )
        }
    }
}

// ----------------------------------------------------
// ---- TAB 3: UNBREAKABLE ACCOUNTABILITY TRACKER ----
// ----------------------------------------------------
@Composable
fun TrackingScreen(
    relapses: List<RelapseRecord>
) {
    val sdfDayName = remember { SimpleDateFormat("EEEE, MMMM dd, yyyy", Locale.getDefault()) }
    val sdfCompare = remember { SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()) }
    val sdfTime = remember { SimpleDateFormat("hh:mm a", Locale.getDefault()) }

    if (relapses.isEmpty()) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 18.dp),
            contentPadding = PaddingValues(top = 24.dp, bottom = 80.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                Text(
                    text = "The Composure Arena",
                    color = LightSlate,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.SansSerif,
                    modifier = Modifier.fillMaxWidth(),
                    letterSpacing = (-0.5).sp
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "A zero-incident database represents flawless mental fortitude.",
                    color = TextGray,
                    fontSize = 11.sp,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(24.dp))
            }

            // Flawless status centerpiece
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 24.dp),
                    colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
                    border = BorderStroke(1.dp, MintPrimary.copy(alpha = 0.3f))
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(125.dp)
                                .background(MintPrimary.copy(alpha = 0.05f), CircleShape)
                                .border(2.dp, MintPrimary, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "100%",
                                    color = MintPrimary,
                                    fontSize = 32.sp,
                                    fontWeight = FontWeight.Black
                                )
                                Text(
                                    text = "COMPOSURE",
                                    color = MintPrimary,
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Black,
                                    letterSpacing = 1.sp
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(20.dp))
                        Text(
                            text = "PRISTINE ARENA SLATE",
                            color = LightSlate,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "No compulsive overrides or vulnerability slips have been recorded. You are operating at peak logic capacity.",
                            color = TextGray,
                            fontSize = 11.sp,
                            textAlign = TextAlign.Center,
                            lineHeight = 16.sp
                        )
                    }
                }
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DarkGreyCard.copy(alpha = 0.4f)),
                    border = BorderStroke(1.dp, Color.White.copy(alpha = 0.04f))
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "⚠️",
                            fontSize = 24.sp
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "How tracking records are logged",
                                color = LightSlate,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Use the dashboard tools to document urge encounters or slips. Records are instantly catalogued here to track real-time biological patterns.",
                                color = TextGray,
                                fontSize = 10.sp,
                                lineHeight = 14.sp
                            )
                        }
                    }
                }
            }
        }
    } else {
        // Group and sort
        val groupedLogs = remember(relapses) {
            relapses.groupBy { record ->
                sdfCompare.format(Date(record.timestamp))
            }.toList().sortedByDescending { it.first } // newest dates on top
        }

        val slips = remember(relapses) { relapses.filter { !it.triggerType.startsWith("URGE:") } }
        val urges = remember(relapses) { relapses.filter { it.triggerType.startsWith("URGE:") } }
        val totalSlips = slips.size
        val totalUrges = urges.size
        val composureScore = (100 - (totalSlips * 20) - (totalUrges * 5)).coerceIn(0, 100)

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 18.dp),
            contentPadding = PaddingValues(top = 24.dp, bottom = 80.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                Text(
                    text = "The Composure Arena",
                    color = LightSlate,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.SansSerif,
                    modifier = Modifier.fillMaxWidth(),
                    letterSpacing = (-0.5).sp
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Dynamic timeline of logged battles, defensive blocks, and vulnerability overrides.",
                    color = TextGray,
                    fontSize = 11.sp,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(20.dp))
            }

            // Stats score card (100% goes down)
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 24.dp),
                    colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
                    border = BorderStroke(1.dp, if (composureScore > 50) MintPrimary.copy(alpha = 0.2f) else CrimsonAccent.copy(alpha = 0.2f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "COMPOSURE RATING",
                                    color = TextGray,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Black,
                                    letterSpacing = 1.sp
                                )
                                Text(
                                    text = "$composureScore%",
                                    color = if (composureScore > 70) MintPrimary else if (composureScore > 40) YellowAccent else CrimsonAccent,
                                    fontSize = 32.sp,
                                    fontWeight = FontWeight.Black
                                )
                            }

                            Box(
                                modifier = Modifier
                                    .size(54.dp)
                                    .background(if (composureScore > 50) MintPrimary.copy(alpha = 0.1f) else CrimsonAccent.copy(alpha = 0.1f), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = if (composureScore > 50) Icons.Default.Shield else Icons.Default.Warning,
                                    contentDescription = null,
                                    tint = if (composureScore > 50) MintPrimary else CrimsonAccent,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                        }

                        Divider(color = Color.White.copy(alpha = 0.05f), modifier = Modifier.padding(vertical = 12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Urge Blocks", color = TextGray, fontSize = 9.sp)
                                Text("$totalUrges Defended", color = MintPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            }
                            Column(modifier = Modifier.weight(1f), horizontalAlignment = Alignment.End) {
                                Text("Slips Fapped", color = TextGray, fontSize = 9.sp)
                                Text("$totalSlips Overridden", color = if (totalSlips == 0) MintPrimary else CrimsonAccent, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            // Timeline logs
            groupedLogs.forEach { (dateStr, records) ->
                item {
                    val parsedDate = try { sdfCompare.parse(dateStr) } catch (e: Exception) { null }
                    val headerText = if (parsedDate != null) sdfDayName.format(parsedDate) else dateStr

                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp)
                    ) {
                        Text(
                            text = headerText.uppercase(),
                            color = MintPrimary,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 1.5.sp,
                            modifier = Modifier.padding(bottom = 8.dp, start = 4.dp)
                        )
                    }
                }

                items(records) { record ->
                    val isUrge = record.triggerType.startsWith("URGE:")
                    val cleanTriggerName = if (isUrge) {
                        record.triggerType.substringAfter("URGE:").trim()
                    } else {
                        record.triggerType
                    }

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 10.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isUrge) MintTertiary.copy(alpha = 0.1f) else CrimsonDark.copy(alpha = 0.1f)
                        ),
                        border = BorderStroke(
                            1.dp,
                            color = if (isUrge) MintPrimary.copy(alpha = 0.25f) else CrimsonAccent.copy(alpha = 0.25f)
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .background(if (isUrge) MintPrimary.copy(alpha = 0.15f) else CrimsonAccent.copy(alpha = 0.15f), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = if (isUrge) Icons.Default.Shield else Icons.Default.Dangerous,
                                    contentDescription = null,
                                    tint = if (isUrge) MintPrimary else CrimsonAccent,
                                    modifier = Modifier.size(18.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = if (isUrge) "URGE PREVENTED" else "SLIP LOGGED",
                                        color = if (isUrge) MintPrimary else CrimsonAccent,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Black,
                                        letterSpacing = 1.sp
                                    )
                                    Text(
                                        text = sdfTime.format(Date(record.timestamp)),
                                        color = TextGray,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                }

                                Spacer(modifier = Modifier.height(4.dp))

                                Text(
                                    text = "Trigger Context: $cleanTriggerName",
                                    color = LightSlate,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )

                                if (record.notes.isNotEmpty()) {
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "Reflective Notes: \"${record.notes}\"",
                                        color = TextGray,
                                        fontSize = 11.sp,
                                        fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                                        lineHeight = 15.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------
// ---- TAB 3: THE WILLPOWER JOURNAL ----
// ----------------------------------------------------
@Composable
fun JournalScreen(
    entries: List<JournalEntry>,
    onAddEntryClicked: () -> Unit
) {
    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 18.dp),
            contentPadding = PaddingValues(top = 24.dp, bottom = 80.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                Text(
                    text = "Daily Willpower Journal",
                    color = LightSlate,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.SansSerif,
                    modifier = Modifier.fillMaxWidth()
                )
                Text(
                    text = "Observe your mood triggers to build a permanent shield.",
                    color = TextGray,
                    fontSize = 11.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 2.dp, bottom = 24.dp)
                )
            }

            if (entries.isEmpty()) {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 48.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Book,
                            contentDescription = null,
                            tint = TextGray.copy(alpha = 0.2f),
                            modifier = Modifier.size(64.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Your journal is fully clear",
                            color = LightSlate,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "A quiet mind logs daily. Keep notes on temptation strengths.",
                            color = TextGray,
                            fontSize = 11.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(horizontal = 24.dp)
                        )
                    }
                }
            } else {
                items(entries) { entry ->
                    JournalRowCard(entry = entry)
                    Spacer(modifier = Modifier.height(10.dp))
                }
            }
        }

        // FAB WITH CORRESPONDING TESTTAG
        FloatingActionButton(
            onClick = onAddEntryClicked,
            containerColor = MintPrimary,
            contentColor = DeepObsidian,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(20.dp)
                .testTag("add_journal_fab"),
            shape = CircleShape
        ) {
            Icon(imageVector = Icons.Default.Add, contentDescription = "Add LogEntry", modifier = Modifier.size(24.dp))
        }
    }
}

@Composable
fun JournalRowCard(entry: JournalEntry) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.05f))
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = entry.dateString, color = LightSlate, fontSize = 12.sp, fontWeight = FontWeight.Bold)

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .background(MintSecondary.copy(alpha = 0.1f), RoundedCornerShape(8.dp))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Box(modifier = Modifier.size(4.dp).background(MintPrimary, CircleShape))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = entry.mood, color = MintPrimary, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(1.dp)) {
                Text(text = "Resolved Stars:", color = TextGray, fontSize = 10.sp)
                Spacer(modifier = Modifier.width(4.dp))
                repeat(5) { i ->
                    Icon(
                        imageVector = Icons.Default.Star,
                        contentDescription = null,
                        tint = if (i < entry.willpowerScore) YellowAccent else Color.White.copy(alpha = 0.06f),
                        modifier = Modifier.size(12.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(text = entry.reflection, color = LightSlate.copy(alpha = 0.9f), fontSize = 12.sp, lineHeight = 16.sp)
        }
    }
}

// ----------------------------------------------------
// ---- TAB 4: WARRIOR CORE CONFIG PROFILE ----
// ----------------------------------------------------
@Composable
fun ProfileScreen(
    viewModel: StreakViewModel,
    profile: StreakEntity,
    relapses: List<RelapseRecord>
) {
    var editName by remember { mutableStateOf(profile.warriorName) }
    var editAge by remember { mutableStateOf(profile.age.toString()) }
    var editHobbies by remember { mutableStateOf(profile.hobbies) }
    var editQuitReasons by remember { mutableStateOf(profile.quitReasons) }

    var saveSuccessfulMsg by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 18.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        contentPadding = PaddingValues(top = 24.dp, bottom = 48.dp)
    ) {
        item {
            Text(
                text = "Warrior Core Dashboard",
                color = LightSlate,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.SansSerif,
                modifier = Modifier.fillMaxWidth()
            )
            Text(
                text = "Edit profiles, healthy leisure triggers, and observe historic slip statistics.",
                color = TextGray,
                fontSize = 11.sp,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 2.dp, bottom = 20.dp)
            )
        }

        @Suppress("KotlinConstantConditions")
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
                border = BorderStroke(1.dp, Color.White.copy(alpha = 0.05f))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Customize Personal Metrics",
                        color = LightSlate,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )

                    OutlinedTextField(
                        value = editName,
                        onValueChange = { editName = it },
                        label = { Text("Warrior Display Name") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = LightSlate, unfocusedTextColor = LightSlate,
                            focusedBorderColor = MintPrimary, unfocusedBorderColor = Color.White.copy(alpha = 0.1f)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = editAge,
                        onValueChange = { editAge = it },
                        label = { Text("Warrior Age") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = LightSlate, unfocusedTextColor = LightSlate,
                            focusedBorderColor = MintPrimary, unfocusedBorderColor = Color.White.copy(alpha = 0.1f)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = editHobbies,
                        onValueChange = { editHobbies = it },
                        label = { Text("Healthy Leisure / Hobbies") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = LightSlate, unfocusedTextColor = LightSlate,
                            focusedBorderColor = MintPrimary, unfocusedBorderColor = Color.White.copy(alpha = 0.1f)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = editQuitReasons,
                        onValueChange = { editQuitReasons = it },
                        label = { Text("Pillars (Separate with comma)") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = LightSlate, unfocusedTextColor = LightSlate,
                            focusedBorderColor = MintPrimary, unfocusedBorderColor = Color.White.copy(alpha = 0.1f)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    if (saveSuccessfulMsg) {
                        Text(
                            text = "🛡️ Profile configuration secured!",
                            color = MintPrimary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Button(
                        onClick = {
                            viewModel.updateProfile(
                                warriorName = editName,
                                age = editAge.toIntOrNull() ?: profile.age,
                                hobbies = editHobbies,
                                quitReasons = editQuitReasons
                            )
                            saveSuccessfulMsg = true
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MintPrimary),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                    ) {
                        Text("Secure Changes", color = DeepObsidian, fontWeight = FontWeight.Bold)
                    }
                }
            }
            Spacer(modifier = Modifier.height(20.dp))
        }

        // HISTORY CORNER
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
                border = BorderStroke(1.dp, Color.White.copy(alpha = 0.05f))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Temptation Slip Records", color = LightSlate, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        if (relapses.isNotEmpty()) {
                            TextButton(onClick = { viewModel.clearRelapseHistory() }) {
                                Text("Clear History", color = CrimsonAccent, fontSize = 11.sp)
                            }
                        }
                    }

                    if (relapses.isEmpty()) {
                        Text(
                            text = "No recorded slips! Complete cleanliness maintained.",
                            color = TextGray,
                            fontSize = 11.sp,
                            modifier = Modifier.padding(top = 6.dp)
                        )
                    } else {
                        Spacer(modifier = Modifier.height(10.dp))
                        relapses.take(8).forEach { rec ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                val dateStr = remember(rec.timestamp) {
                                    SimpleDateFormat("MMM dd, HH:mm", Locale.getDefault()).format(Date(rec.timestamp))
                                }
                                Text(text = "$dateStr (${rec.triggerType})", color = LightSlate, fontSize = 11.sp)
                                val durationDays = rec.durationBeforeRelapseMillis / (1000 * 60 * 60 * 24)
                                Text(
                                    text = "Streak: $durationDays Days",
                                    color = CrimsonAccent,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------
// ---- DIALOG: INTERACTIVE EMERGENCY SLIP RESETS ----
// ----------------------------------------------------
@Composable
fun RelapseConfirmDialog(
    onDismiss: () -> Unit,
    onSubmit: (trigger: String, notes: String) -> Unit
) {
    var stageIsReally by remember { mutableStateOf(true) }
    var selectedTrigger by remember { mutableStateOf("Boredom") }
    var notes by remember { mutableStateOf("") }

    val triggers = listOf("Boredom", "Late Night Screen", "Social Media Feed", "Stress/Anxiety", "Loneliness", "Fatigue")

    Dialog(onDismissRequest = onDismiss) {
        Card(
            colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
            border = BorderStroke(1.dp, CrimsonAccent.copy(alpha = 0.5f)),
            shape = RoundedCornerShape(14.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .width(300.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                if (stageIsReally) {
                    // STAGE 1: ASK user REALLY?
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = CrimsonAccent,
                        modifier = Modifier.size(44.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Really?",
                        color = LightSlate,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black
                    )
                    Text(
                        text = "Are you absolutely sure you slipped? This will completely reset your active focus stopwatch. Hold on—did you fight?",
                        color = TextGray,
                        fontSize = 12.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 4.dp, bottom = 20.dp),
                        lineHeight = 16.sp
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Button(
                            onClick = onDismiss, // YES WE REFUSE TO RESET! Stayed committed!
                            colors = ButtonDefaults.buttonColors(containerColor = MintPrimary),
                            modifier = Modifier
                                .weight(1.5f)
                                .testTag("decline_reset_btn")
                        ) {
                            Text("No, Stay Clean!", color = DeepObsidian, fontWeight = FontWeight.Black)
                        }

                        OutlinedButton(
                            onClick = { stageIsReally = false }, // They specify yes
                            border = BorderStroke(1.dp, CrimsonAccent),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = CrimsonAccent),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("confirm_reset_btn")
                        ) {
                            Text("Yes, I Slipped")
                        }
                    }
                } else {
                    // STAGE 2: SPECIFY REASONS FOR LEARNING OUTCOMES
                    Text(
                        text = "Analyze the Trigger",
                        color = LightSlate,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                    Text(
                        text = "Categorizing the visual trigger helps our anti-distraction system shields.",
                        color = TextGray,
                        fontSize = 11.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
                    )

                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp)
                            .verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        triggers.forEach { trig ->
                            val active = selectedTrigger == trig
                            Surface(
                                onClick = { selectedTrigger = trig },
                                color = if (active) CrimsonAccent.copy(alpha = 0.2f) else DeepObsidian.copy(alpha = 0.5f),
                                border = BorderStroke(1.dp, if (active) CrimsonAccent else Color.White.copy(alpha = 0.08f)),
                                shape = RoundedCornerShape(6.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = trig,
                                    color = if (active) CrimsonAccent else LightSlate,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(10.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("What did you learn?") },
                        maxLines = 2,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = LightSlate, unfocusedTextColor = LightSlate,
                            focusedBorderColor = CrimsonAccent, unfocusedBorderColor = Color.White.copy(alpha = 0.1f)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedButton(
                            onClick = onDismiss,
                            modifier = Modifier.weight(1f),
                            border = BorderStroke(1.dp, Color.White.copy(alpha = 0.12f)),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = LightSlate)
                        ) {
                            Text("Abort")
                        }

                        Button(
                            onClick = { onSubmit(selectedTrigger, notes) },
                            colors = ButtonDefaults.buttonColors(containerColor = CrimsonAccent),
                            modifier = Modifier
                                .weight(1.5f)
                                .testTag("submit_reset_btn")
                        ) {
                            Text("Reset Watch", color = LightSlate, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------
// ---- DIALOG: INTERACTIVE URGE RESISTS ----
// ----------------------------------------------------
@Composable
fun UrgeDefenseDialog(
    onDismiss: () -> Unit,
    onSubmit: (trigger: String, notes: String) -> Unit
) {
    var selectedTrigger by remember { mutableStateOf("Boredom") }
    var notes by remember { mutableStateOf("") }
    
    val triggers = listOf("Boredom", "Late Night Screen", "Social Media Feed", "Stress/Anxiety", "Loneliness", "Fatigue")
    
    Dialog(onDismissRequest = onDismiss) {
        Card(
            colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
            border = BorderStroke(1.dp, MintPrimary.copy(alpha = 0.5f)),
            shape = RoundedCornerShape(14.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .width(300.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Default.Shield,
                    contentDescription = null,
                    tint = MintPrimary,
                    modifier = Modifier.size(44.dp)
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "Deflect Vulnerable Urge",
                    color = LightSlate,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black
                )
                Text(
                    text = "Documenting intense urges strengthens logical cognitive control. This notes your defense in the Tracking Arena.",
                    color = TextGray,
                    fontSize = 11.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 4.dp, bottom = 16.dp),
                    lineHeight = 15.sp
                )
                
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    triggers.forEach { trig ->
                        val active = selectedTrigger == trig
                        Surface(
                            onClick = { selectedTrigger = trig },
                            color = if (active) MintPrimary.copy(alpha = 0.15f) else DeepObsidian.copy(alpha = 0.5f),
                            border = BorderStroke(1.dp, if (active) MintPrimary else Color.White.copy(alpha = 0.08f)),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = trig,
                                color = if (active) MintPrimary else LightSlate,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(10.dp)
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                
                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("How will you physically distract?", fontSize = 11.sp) },
                    maxLines = 2,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MintPrimary,
                        unfocusedBorderColor = Color.White.copy(alpha = 0.1f),
                        focusedLabelColor = MintPrimary,
                        unfocusedLabelColor = TextGray,
                        focusedTextColor = LightSlate,
                        unfocusedTextColor = LightSlate
                    ),
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        border = BorderStroke(1.dp, TextGray.copy(alpha = 0.5f)),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TextGray),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancel", fontSize = 12.sp)
                    }
                    
                    Button(
                        onClick = { onSubmit(selectedTrigger, notes) },
                        colors = ButtonDefaults.buttonColors(containerColor = MintPrimary),
                        modifier = Modifier.weight(1.5f)
                    ) {
                        Text("Defend & Log", color = DeepObsidian, fontWeight = FontWeight.Black, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

// ---- DIALOG: WRITE JOURNAL ENTRY ----
@Composable
fun JournalLogDialog(
    onDismiss: () -> Unit,
    onSubmit: (stars: Int, mood: String, reflection: String) -> Unit
) {
    var stars by remember { mutableStateOf(4) }
    var mood by remember { mutableStateOf("Energetic") }
    var notes by remember { mutableStateOf("") }

    val moods = listOf("Energetic", "Calm", "Bored", "Struggling", "Defiant", "Inspired")

    Dialog(onDismissRequest = onDismiss) {
        Card(
            colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
            border = BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(18.dp)
                    .width(300.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(text = "Log Daily Willpower State", color = LightSlate, fontSize = 16.sp, fontWeight = FontWeight.Bold)

                // Stars rating picker
                Column {
                    Text(text = "Willpower Sincerity / Strength", color = TextGray, fontSize = 11.sp)
                    Row(
                        modifier = Modifier.padding(top = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        repeat(5) { id ->
                            val activeVal = id + 1
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = null,
                                tint = if (activeVal <= stars) YellowAccent else Color.White.copy(alpha = 0.08f),
                                modifier = Modifier
                                    .size(28.dp)
                                    .clickable { stars = activeVal }
                            )
                        }
                    }
                }

                // Mood select
                Column {
                    Text(text = "Current Mood State", color = TextGray, fontSize = 11.sp, modifier = Modifier.padding(bottom = 4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        moods.forEach { md ->
                            val active = mood == md
                            Box(
                                modifier = Modifier
                                    .background(
                                        color = if (active) MintSecondary.copy(alpha = 0.15f) else DeepObsidian.copy(alpha = 0.4f),
                                        shape = RoundedCornerShape(8.dp)
                                    )
                                    .border(1.dp, if (active) MintPrimary else Color.White.copy(alpha = 0.05f), RoundedCornerShape(8.dp))
                                    .clickable { mood = md }
                                    .padding(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text(text = md, color = if (active) MintPrimary else LightSlate, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Daily Reflection / Thoughts") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = LightSlate, unfocusedTextColor = LightSlate,
                        focusedBorderColor = MintPrimary, unfocusedBorderColor = Color.White.copy(alpha = 0.08f)
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(90.dp)
                        .testTag("journal_notes_input")
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancel", color = LightSlate)
                    }

                    Button(
                        onClick = { onSubmit(stars, mood, notes) },
                        colors = ButtonDefaults.buttonColors(containerColor = MintPrimary),
                        modifier = Modifier
                            .weight(1.5f)
                            .testTag("submit_journal_btn")
                    ) {
                        Text("File Log", color = DeepObsidian, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

// ---- COPING STRATEGIES SELECTION DROPDOWN ----
@Composable
fun AiTriggerPicker(
    onDismiss: () -> Unit,
    onSubmit: (trigger: String, strength: String) -> Unit
) {
    var triggerText by remember { mutableStateOf("Boredom") }
    var urgeVal by remember { mutableStateOf("3") }

    val options = listOf("Boredom", "Anxiety", "Late Night Late Hours", "Internet Social Feeds", "Loneliness")

    Dialog(onDismissRequest = onDismiss) {
        Card(
            colors = CardDefaults.cardColors(containerColor = DarkGreyCard),
            border = BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(18.dp)
                    .width(300.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(text = "Specify Urge Parameters", color = LightSlate, fontSize = 15.sp, fontWeight = FontWeight.Bold)

                Text(text = "Select source trigger:", color = TextGray, fontSize = 11.sp)
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    options.forEach { opt ->
                        val active = triggerText == opt
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    if (active) MintSecondary.copy(alpha = 0.1f) else Color.Transparent,
                                    RoundedCornerShape(6.dp)
                                    )
                                .clickable { triggerText = opt }
                                .padding(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(5.dp)
                                    .background(if (active) MintPrimary else TextGray, CircleShape)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(text = opt, color = if (active) MintPrimary else LightSlate, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                Text(text = "Urge Sensation Strength (1-5):", color = TextGray, fontSize = 11.sp)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    listOf("1", "2", "3", "4", "5").forEach { num ->
                        val active = urgeVal == num
                        Box(
                            modifier = Modifier
                                .background(if (active) MintPrimary else DeepObsidian, CircleShape)
                                .clickable { urgeVal = num }
                                .size(34.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = num,
                                color = if (active) DeepObsidian else LightSlate,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth().padding(top = 10.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                        Text("Cancel", color = LightSlate)
                    }
                    Button(
                        onClick = { onSubmit(triggerText, urgeVal) },
                        colors = ButtonDefaults.buttonColors(containerColor = MintPrimary),
                        modifier = Modifier.weight(1.5f).testTag("dialog_request_boost_submit_btn")
                    ) {
                        Text("Summon Boost", color = DeepObsidian, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
