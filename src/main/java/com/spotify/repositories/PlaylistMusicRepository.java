package com.spotify.repositories;
import com.spotify.entities.Playlist;
import com.spotify.entities.PlaylistMusic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface PlaylistMusicRepository extends JpaRepository<PlaylistMusic, Long> {
    List<PlaylistMusic> findByPlaylistOrderByPositionAsc(Playlist playlist);
    Optional<PlaylistMusic> findByPlaylistAndMusicId(Playlist playlist, String musicId);
    @Query("SELECT MAX(pm.position) FROM PlaylistMusic pm WHERE pm.playlist = :playlist")
    Optional<Integer> findMaxPositionByPlaylist(@Param("playlist") Playlist playlist);
    void deleteByPlaylistAndMusicId(Playlist playlist, String musicId);
}
