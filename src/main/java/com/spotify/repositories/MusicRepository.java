package com.spotify.repositories;

import com.spotify.entities.Music;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MusicRepository extends JpaRepository<Music, String> {
    boolean existsByNameAndBandAndGenre(String name, String band, String genre);
    Optional<Music> findByNameAndBandAndGenre(String name, String band, String genre);
}
