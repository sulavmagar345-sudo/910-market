package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "relapse_history")
data class RelapseRecord(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val timestamp: Long,
    val triggerType: String, // e.g., "Boredom", "Stress", "Social Media", "Late Night", "Loneliness", "Anxiety", "Fatigue"
    val durationBeforeRelapseMillis: Long, // How long this streak lasted
    val notes: String = ""
)
