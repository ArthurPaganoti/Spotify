package com.spotify.repositories;
import com.spotify.entities.Playlist;
import com.spotify.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    List<Playlist> findByUserOrderByCreatedAtDesc(User user);
    @Query("SELECT p FROM Playlist p WHERE p.isPublic = true ORDER BY p.createdAt DESC")
    List<Playlist> findAllPublicPlaylists();
    @Query("SELECT p FROM Playlist p WHERE (p.isPublic = true OR p.user.id = :userId) ORDER BY p.createdAt DESC")
    List<Playlist> findAllAccessiblePlaylists(@Param("userId") Long userId);
    @Query("SELECT DISTINCT p FROM Playlist p " +
           "LEFT JOIN p.collaborators c " +
           "WHERE p.user.id = :userId OR (c.user.id = :userId AND c.status = 'ACCEPTED') " +
           "ORDER BY p.createdAt DESC")
    List<Playlist> findMyPlaylistsAndCollaborations(@Param("userId") Long userId);
    @Query("SELECT DISTINCT p FROM Playlist p " +
           "LEFT JOIN p.collaborators c " +
           "WHERE p.isPublic = true OR p.user.id = :userId OR (c.user.id = :userId AND c.status = 'ACCEPTED') " +
           "ORDER BY p.createdAt DESC")
    List<Playlist> findAllAccessiblePlaylistsIncludingCollaborations(@Param("userId") Long userId);
    Optional<Playlist> findByIdAndUser(Long id, User user);
}
