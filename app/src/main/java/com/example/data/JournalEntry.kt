package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "daily_journal")
data class JournalEntry(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val dateMillis: Long,          // Midnight timestamp of the logged day
    val dateString: String,        // format "YYYY-MM-DD"
    val willpowerScore: Int,       // 1-5 scale star rating
    val mood: String,              // e.g., "Calm", "Energetic", "Tempted", "Anxious", "Bored"
    val reflection: String         // Reflection text
)
