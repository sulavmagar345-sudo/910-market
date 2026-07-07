package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "streak_profile")
data class StreakEntity(
    @PrimaryKey val id: Int = 1,
    val startTimeMillis: Long = System.currentTimeMillis(),
    val longestStreakMillis: Long = 0L,
    val warriorName: String = "Warrior",
    val quitReasons: String = "Mental Clarity, Physical Peak, Absolute Focus, Healthy Habits",
    val levelThresholdDays: Int = 90,
    
    // Onboarding values
    val isOnboarded: Boolean = false,
    val age: Int = 18,
    val whyJoin: String = "",
    val howSpendTime: String = "",
    val hobbies: String = "",
    val showAppGuide: Boolean = false, // Shows guide screen post onboarding
    
    // Custom Challenges Systems
    val activeChallengeHours: Int = 0, // 0 = none, 24, 28, 48
    val challengeStartTime: Long = 0L,
    val challengeCompleted24h: Boolean = false,
    val challengeCompleted28h: Boolean = false,
    val challengeCompleted48h: Boolean = false,
    val warriorRank: String = "Initiate Vanguard",
    
    // Male-Targeted distracting filters options
    val blockAdultSensory: Boolean = true,
    val blockLateNightDoomscroll: Boolean = true,
    val silencerTriggerWords: Boolean = true
)
