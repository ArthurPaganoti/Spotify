package com.spotify.repositories;

import com.spotify.entities.Like;
import com.spotify.entities.Music;
import com.spotify.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndMusic(User user, Music music);
    boolean existsByUserAndMusic(User user, Music music);
    List<Like> findByUserOrderByCreatedAtDesc(User user);
    Page<Like> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    void deleteByUserAndMusic(User user, Music music);
    long countByMusic(Music music);
}
