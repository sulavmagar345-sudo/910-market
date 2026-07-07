package com.example.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface StreakDao {
    // ---- Streak Profile Queries ----
    @Query("SELECT * FROM streak_profile WHERE id = 1 LIMIT 1")
    fun getStreakProfileFlow(): Flow<StreakEntity?>

    @Query("SELECT * FROM streak_profile WHERE id = 1 LIMIT 1")
    suspend fun getStreakProfile(): StreakEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveStreakProfile(profile: StreakEntity)

    // ---- Relapse Records ----
    @Query("SELECT * FROM relapse_history ORDER BY timestamp DESC")
    fun getAllRelapseRecordsFlow(): Flow<List<RelapseRecord>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRelapseRecord(record: RelapseRecord)

    @Query("DELETE FROM relapse_history")
    suspend fun clearRelapseHistory()

    // ---- Journal Entries ----
    @Query("SELECT * FROM daily_journal ORDER BY dateMillis DESC")
    fun getAllJournalEntriesFlow(): Flow<List<JournalEntry>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertJournalEntry(entry: JournalEntry)
}
