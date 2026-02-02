package com.ecommerce.api_geek_store.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_token",
        indexes = {
                @Index(name = "idx_pwd_token_code", columnList = "code")
        }
)
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private LocalDateTime expirationTime;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    public PasswordResetToken() {}

    public PasswordResetToken(String code, User user) {
        this.code = code;
        this.user = user;
        this.expirationTime = LocalDateTime.now().plusMinutes(10);
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public LocalDateTime getExpirationTime() { return expirationTime; }
    public User getUser() { return user; }
}