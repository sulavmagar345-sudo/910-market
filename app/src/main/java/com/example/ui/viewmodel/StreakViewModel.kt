package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.*
import com.example.api.RetrofitClient
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class StreakViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getDatabase(application)
    private val repository = StreakRepository(db.streakDao())

    // Profile State Flow
    val streakProfile = repository.streakProfile.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = null
    )

    // History & Journals logs
    val relapseHistory = repository.relapseHistory.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val journalEntries = repository.journalEntries.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    // Main running streak ticking elapsed millis
    private val _streakElapsedMillis = MutableStateFlow(0L)
    val streakElapsedMillis: StateFlow<Long> = _streakElapsedMillis.asStateFlow()

    // Challenge ticking countdown remaining seconds and progress
    private val _challengeRemainingSeconds = MutableStateFlow(0L)
    val challengeRemainingSeconds: StateFlow<Long> = _challengeRemainingSeconds.asStateFlow()

    private val _challengeProgress = MutableStateFlow(0f)
    val challengeProgress: StateFlow<Float> = _challengeProgress.asStateFlow()

    // Keep track of active ticker job
    private var tickerJob: Job? = null

    // Gemini/AI custom quote generation state
    private val _aiMotivationState = MutableStateFlow<AiState>(AiState.Idle)
    val aiMotivationState: StateFlow<AiState> = _aiMotivationState.asStateFlow()

    // Breathing shield state
    private val _breathingState = MutableStateFlow(BreathingCycle.IDLE)
    val breathingState: StateFlow<BreathingCycle> = _breathingState.asStateFlow()

    private val _breathingSecondsLeft = MutableStateFlow(0)
    val breathingSecondsLeft: StateFlow<Int> = _breathingSecondsLeft.asStateFlow()

    // Fresh Welcome Quote generated upon startup
    private val _dailyWelcomeQuote = MutableStateFlow("Your potential is infinite. Conquer your base desires, cultivate your mental forge, and rise above the noise.")
    val dailyWelcomeQuote: StateFlow<String> = _dailyWelcomeQuote.asStateFlow()

    init {
        // Enforce basic initial profile if missing
        viewModelScope.launch {
            val dbProfile = repository.getProfileDirect()
            if (dbProfile == null) {
                repository.saveProfile(StreakEntity())
            }
        }
        startGlobalTicker()
        fetchWelcomeQuote()
    }

    private fun startGlobalTicker() {
        tickerJob?.cancel()
        tickerJob = viewModelScope.launch {
            while (true) {
                val profile = streakProfile.value
                if (profile != null) {
                    val now = System.currentTimeMillis()
                    
                    // 1. Tick main streak only if a challenge is active
                    if (profile.activeChallengeHours > 0) {
                        val streakElapsed = now - profile.startTimeMillis
                        _streakElapsedMillis.value = if (streakElapsed > 0) streakElapsed else 0L
                    } else {
                        _streakElapsedMillis.value = 0L
                    }

                    // 2. Tick challenge countdown if a challenge is active
                    if (profile.activeChallengeHours > 0) {
                        val challengeTotalSeconds = profile.activeChallengeHours * 60 * 60L
                        val challengeEndTime = profile.challengeStartTime + (challengeTotalSeconds * 1000)
                        val remainingMillis = challengeEndTime - now
                        
                        if (remainingMillis <= 0L) {
                            _challengeRemainingSeconds.value = 0L
                            _challengeProgress.value = 1.0f
                        } else {
                            _challengeRemainingSeconds.value = remainingMillis / 1000
                            val secondsPassed = challengeTotalSeconds - (remainingMillis / 1000)
                            val progress = (secondsPassed.toFloat() / challengeTotalSeconds.toFloat()).coerceIn(0f, 1.0f)
                            _challengeProgress.value = progress
                        }
                    } else {
                        _challengeRemainingSeconds.value = 0L
                        _challengeProgress.value = 0f
                    }
                }
                delay(1000)
            }
        }
    }

    private fun fetchWelcomeQuote() {
        viewModelScope.launch {
            // Pick a high-power discipline advice for immediate greeting
            val welcomes = listOf(
                "Do not trade what you want most for what you want now.",
                "He who conquers himself is mightier than he who conquers a city.",
                "Discipline beats motivation. Show up today and command your actions.",
                "Your mind is a palace, do not dilute it with instant sensory loops.",
                "Clean vision, absolute physical composure, raw focus. Stay centered."
            )
            val fallback = welcomes.random()
            
            // Try to load a hyper custom fiery quote from Gemini, fallback to classic text
            val prompt = "Write a high-intensity 1-sentence fire discipline reminder for a youth building mental clarity, escaping dopamine addiction."
            val custom = RetrofitClient.getMotivationalBoost(prompt, fallback)
            _dailyWelcomeQuote.value = custom
        }
    }

    // ---- ONBOARDING OPERATIONS ----
    fun saveOnboardingProfile(
        name: String,
        age: Int,
        whyJoin: String,
        howSpendTime: String,
        hobbies: String
    ) {
        viewModelScope.launch {
            val current = streakProfile.value ?: StreakEntity()
            val updatedProfile = current.copy(
                warriorName = name,
                age = age,
                whyJoin = whyJoin,
                howSpendTime = howSpendTime,
                hobbies = hobbies,
                isOnboarded = true,
                showAppGuide = true // Trigger the guide next
            )
            repository.saveProfile(updatedProfile)
        }
    }

    fun completeAppGuide() {
        viewModelScope.launch {
            val current = streakProfile.value
            if (current != null) {
                repository.saveProfile(current.copy(showAppGuide = false))
            }
        }
    }

    // ---- COMPREHENSIVE CHALLENGES ACTIONS ----
    fun startChallenge(hours: Int) {
        viewModelScope.launch {
            val current = streakProfile.value
            if (current != null) {
                val now = System.currentTimeMillis()
                val updated = current.copy(
                    activeChallengeHours = hours,
                    challengeStartTime = now,
                    startTimeMillis = now
                )
                repository.saveProfile(updated)
            }
        }
    }

    fun claimCompletedChallengeReward() {
        viewModelScope.launch {
            val current = streakProfile.value
            if (current != null && current.activeChallengeHours > 0) {
                val hours = current.activeChallengeHours
                
                // Set ranks and flags based on completion
                val finalRank: String
                val cCompleted24h: Boolean
                val cCompleted28h: Boolean
                val cCompleted48h: Boolean

                when (hours) {
                    24 -> {
                        finalRank = if (current.warriorRank == "Initiate Vanguard") "Bronze Willpower Squire" else current.warriorRank
                        cCompleted24h = true
                        cCompleted28h = current.challengeCompleted28h
                        cCompleted48h = current.challengeCompleted48h
                    }
                    28 -> {
                        finalRank = "Gold Mind-Overlord"
                        cCompleted24h = current.challengeCompleted24h
                        cCompleted28h = true
                        cCompleted48h = current.challengeCompleted48h
                    }
                    48 -> {
                        finalRank = "Unbreakable Sovereignty"
                        cCompleted24h = current.challengeCompleted24h
                        cCompleted28h = current.challengeCompleted28h
                        cCompleted48h = true
                    }
                    else -> {
                        finalRank = current.warriorRank
                        cCompleted24h = current.challengeCompleted24h
                        cCompleted28h = current.challengeCompleted28h
                        cCompleted48h = current.challengeCompleted48h
                    }
                }

                val updatedProfile = current.copy(
                    activeChallengeHours = 0,
                    challengeStartTime = 0L,
                    warriorRank = finalRank,
                    challengeCompleted24h = cCompleted24h,
                    challengeCompleted28h = cCompleted28h,
                    challengeCompleted48h = cCompleted48h
                )
                
                repository.saveProfile(updatedProfile)
                
                // Pull a custom victory speech from Gemini!
                triggerChallengeCompleteSpeech(hours, finalRank)
            }
        }
    }

    private fun triggerChallengeCompleteSpeech(hours: Int, rank: String) {
        viewModelScope.launch {
            _aiMotivationState.value = AiState.Loading
            val prompt = """
                I successfully completed the intense $hours-hour willpower challenge!
                My mind was tested, but I conquered the base desires. My rank has officially upgraded to $rank.
                Show me a burst of extreme motivation and praise to secure my win, make me feel like an elite operator of my focus.
                Be intense, energetic, and concise (maximum 3 sentences).
            """.trimIndent()
            
            val fallback = "CHALLENGE CONQUERED! You held the line for $hours hours straight. Your willpower rank has been promoted to $rank! Respect the grind, stay absolute, and never yield the line."
            val custom = RetrofitClient.getMotivationalBoost(prompt, fallback)
            _aiMotivationState.value = AiState.Success(custom)
        }
    }

    fun abandonActiveChallenge() {
        viewModelScope.launch {
            val current = streakProfile.value
            if (current != null) {
                repository.saveProfile(
                    current.copy(
                        activeChallengeHours = 0,
                        challengeStartTime = 0L
                    )
                )
            }
        }
    }

    // ---- DIGITAL DISTRACTION FILTERS SETTING ----
    fun saveDistractionFilters(
        sensory: Boolean,
        doomScroll: Boolean,
        triggerWords: Boolean
    ) {
        viewModelScope.launch {
            val current = streakProfile.value
            if (current != null) {
                val updated = current.copy(
                    blockAdultSensory = sensory,
                    blockLateNightDoomscroll = doomScroll,
                    silencerTriggerWords = triggerWords
                )
                repository.saveProfile(updated)
            }
        }
    }

    // ---- GENERAL APP ACTIONS ----
    fun logRelapse(trigger: String, notes: String) {
        viewModelScope.launch {
            // If they had an active challenge, they unfortunately lose it
            val currentProfile = streakProfile.value ?: StreakEntity()
            
            repository.logRelapse(trigger, notes)
            
            storyRelapseChallengeDecline()
            
            // Resets ticker state
            _streakElapsedMillis.value = 0L
        }
    }

    fun logUrgeResisted(trigger: String, notes: String) {
        viewModelScope.launch {
            val now = System.currentTimeMillis()
            val record = RelapseRecord(
                timestamp = now,
                triggerType = "URGE: $trigger",
                durationBeforeRelapseMillis = 0L,
                notes = notes.ifEmpty { "Deflected intense compulsive brain urge. Composure preserved!" }
            )
            db.streakDao().insertRelapseRecord(record)
        }
    }

    private fun storyRelapseChallengeDecline() {
        viewModelScope.launch {
            val current = streakProfile.value ?: StreakEntity()
            repository.saveProfile(
                current.copy(
                    activeChallengeHours = 0,
                    challengeStartTime = 0L
                )
            )
        }
    }

    fun updateProfile(warriorName: String, age: Int, hobbies: String, quitReasons: String) {
        viewModelScope.launch {
            val current = streakProfile.value ?: StreakEntity()
            val updated = current.copy(
                warriorName = warriorName,
                age = age,
                hobbies = hobbies,
                quitReasons = quitReasons
            )
            repository.saveProfile(updated)
        }
    }

    fun addJournalEntry(stars: Int, mood: String, reflection: String) {
        viewModelScope.launch {
            repository.addJournalEntry(stars, mood, reflection)
        }
    }

    fun clearRelapseHistory() {
        viewModelScope.launch {
            repository.clearRelapses()
        }
    }

    // Requests an urge cope from Gemini AI
    fun requestAiBoost(trigger: String, urgeStrength: String) {
        viewModelScope.launch {
            _aiMotivationState.value = AiState.Loading
            
            val prompt = """
                I am a young warrior on a self-improvement willpower journey. I am feeling a strong urge right now (strength: $urgeStrength/5 scale).
                My current immediate psychological trigger is: $trigger.
                Please write a direct, high-energy, fiery motivational speech that reminds me of my massive potential, helps me reject base impulses, and encourages me to focus on creating an unbreakable character.
                Speak like a direct older brother, physical drill coach, or legendary guide. Use modern, engaging language. 
                Keep it to 2-3 lines maximum so I can read it fast. Be incredibly supportive and intense. No generic clichés!
            """.trimIndent()

            val fallback = getFallbackQuote(trigger)
            val result = RetrofitClient.getMotivationalBoost(prompt, fallback)
            _aiMotivationState.value = AiState.Success(result)
        }
    }

    fun clearAiState() {
        _aiMotivationState.value = AiState.Idle
    }

    private fun getFallbackQuote(trigger: String): String {
        val quotes = listOf(
            "The pain of discipline is temporary, but the pain of regret is permanent. Stand up, do 20 pushups, and reclaim your clear focus. You are meant for greatness.",
            "An urge is just neural noise—it is a craving for dopamine, not a choice. You are the active director of your body, not a slave to impulses. Walk away from the screen.",
            "You desire mental peak, raw energy, and high focus. Stay strong in the moment of friction. Your future self is begging you not to quit today.",
            "Boredom is the ultimate trigger. Don't let your mind wander into old destructive loops. Stand tall, drink ice-cold water, and go learn something challenging.",
            "Discipline isn't about feeling like it; it's about doing what is right even when you don't. Conquer the impulse and build an unbreakable spirit!"
        )
        return quotes.random()
    }

    // Box Breathing: Inhale (4s), Hold (4s), Exhale (4s), Hold (4s)
    private var breathingJob: Job? = null
    fun startBreathingExercise() {
        breathingJob?.cancel()
        breathingJob = viewModelScope.launch {
            var round = 0
            while (round < 4) { // 4 standard rounds (~64 seconds)
                _breathingState.value = BreathingCycle.INHALE
                for (i in 4 downTo 1) {
                    _breathingSecondsLeft.value = i
                    delay(1000)
                }
                
                _breathingState.value = BreathingCycle.HOLD_IN
                for (i in 4 downTo 1) {
                    _breathingSecondsLeft.value = i
                    delay(1000)
                }

                _breathingState.value = BreathingCycle.EXHALE
                for (i in 4 downTo 1) {
                    _breathingSecondsLeft.value = i
                    delay(1000)
                }

                _breathingState.value = BreathingCycle.HOLD_OUT
                for (i in 4 downTo 1) {
                    _breathingSecondsLeft.value = i
                    delay(1000)
                }
                round++
            }
            _breathingState.value = BreathingCycle.IDLE
        }
    }

    fun stopBreathingExercise() {
        breathingJob?.cancel()
        _breathingState.value = BreathingCycle.IDLE
    }

    override fun onCleared() {
        super.onCleared()
        tickerJob?.cancel()
        breathingJob?.cancel()
    }
}

sealed interface AiState {
    object Idle : AiState
    object Loading : AiState
    data class Success(val quote: String) : AiState
}

enum class BreathingCycle(val label: String, val actionText: String) {
    IDLE("Ready to calm your pulses?", "Enter Shield Breathing"),
    INHALE("Inhale Strength", "Inhale..."),
    HOLD_IN("Hold the Willpower", "Hold..."),
    EXHALE("Release the Temptation", "Exhale..."),
    HOLD_OUT("Rest & Centered", "Absorb Clarity...")
}

