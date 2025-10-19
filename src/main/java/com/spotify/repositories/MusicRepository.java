package com.spotify.repositories;

import com.spotify.entities.Music;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MusicRepository extends JpaRepository<Music, String> {
    boolean existsByNameAndBand(String name, String band);
    Optional<Music> findByNameAndBand(String name, String band);
    Page<Music> findAll(Pageable pageable);
}
