package com.spotify.repositories;

import com.spotify.entities.Playlist;
import com.spotify.entities.PlaylistCollaborator;
import com.spotify.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistCollaboratorRepository extends JpaRepository<PlaylistCollaborator, Long> {
    
    List<PlaylistCollaborator> findByPlaylistAndStatus(Playlist playlist, PlaylistCollaborator.CollaboratorStatus status);
    
    List<PlaylistCollaborator> findByUserAndStatus(User user, PlaylistCollaborator.CollaboratorStatus status);
    
    Optional<PlaylistCollaborator> findByPlaylistAndUser(Playlist playlist, User user);
    
    @Query("SELECT CASE WHEN COUNT(pc) > 0 THEN true ELSE false END FROM PlaylistCollaborator pc " +
           "WHERE pc.playlist = :playlist AND pc.user = :user AND pc.status = 'ACCEPTED'")
    boolean isUserCollaborator(@Param("playlist") Playlist playlist, @Param("user") User user);
}

