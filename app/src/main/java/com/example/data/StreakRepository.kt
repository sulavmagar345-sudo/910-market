package com.example.data

import kotlinx.coroutines.flow.Flow

class StreakRepository(private val streakDao: StreakDao) {

    val streakProfile: Flow<StreakEntity?> = streakDao.getStreakProfileFlow()
    val relapseHistory: Flow<List<RelapseRecord>> = streakDao.getAllRelapseRecordsFlow()
    val journalEntries: Flow<List<JournalEntry>> = streakDao.getAllJournalEntriesFlow()

    suspend fun getProfileDirect(): StreakEntity? {
        return streakDao.getStreakProfile()
    }

    suspend fun saveProfile(profile: StreakEntity) {
        streakDao.saveStreakProfile(profile)
    }

    suspend fun logRelapse(trigger: String, notes: String) {
        val currentProfile = streakDao.getStreakProfile() ?: StreakEntity()
        val now = System.currentTimeMillis()
        val duration = now - currentProfile.startTimeMillis
        
        // Save the relapse log
        val relapseRecord = RelapseRecord(
            timestamp = now,
            triggerType = trigger,
            durationBeforeRelapseMillis = duration,
            notes = notes
        )
        streakDao.insertRelapseRecord(relapseRecord)

        // Reset the start time of the current streak, saving the longest streak if the current one beat it
        val longest = if (duration > currentProfile.longestStreakMillis) duration else currentProfile.longestStreakMillis
        val updatedProfile = currentProfile.copy(
            startTimeMillis = now,
            longestStreakMillis = longest
        )
        streakDao.saveStreakProfile(updatedProfile)
    }

    suspend fun addJournalEntry(willpowerScore: Int, mood: String, reflection: String) {
        val entry = JournalEntry(
            dateMillis = System.currentTimeMillis(),
            dateString = getTodayDateString(),
            willpowerScore = willpowerScore,
            mood = mood,
            reflection = reflection
        )
        streakDao.insertJournalEntry(entry)
    }

    suspend fun clearRelapses() {
        streakDao.clearRelapseHistory()
    }

    private fun getTodayDateString(): String {
        val sdf = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
        return sdf.format(java.util.Date())
    }
}
