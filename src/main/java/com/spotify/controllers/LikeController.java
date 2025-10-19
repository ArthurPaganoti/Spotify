package com.spotify.controllers;

import com.spotify.business.dto.MusicResponseDTO;
import com.spotify.business.dto.ResponseDTO;
import com.spotify.services.LikeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/likes")
@CrossOrigin(origins = "http://localhost:5173")
public class LikeController {
    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @PostMapping("/{musicId}")
    public ResponseEntity<ResponseDTO<String>> toggleLike(
            @PathVariable String musicId,
            Authentication authentication) {
        likeService.toggleLike(musicId, authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(
                true,
                "Like atualizado com sucesso",
                null
        ));
    }

    @GetMapping("/{musicId}/check")
    public ResponseEntity<ResponseDTO<Boolean>> isLiked(
            @PathVariable String musicId,
            Authentication authentication) {
        boolean isLiked = likeService.isLiked(musicId, authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(
                true,
                null,
                isLiked
        ));
    }

    @GetMapping
    public ResponseEntity<ResponseDTO<List<MusicResponseDTO>>> getLikedMusics(
            Authentication authentication) {
        List<MusicResponseDTO> likedMusics = likeService.getLikedMusics(authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(
                true,
                null,
                likedMusics
        ));
    }
}

