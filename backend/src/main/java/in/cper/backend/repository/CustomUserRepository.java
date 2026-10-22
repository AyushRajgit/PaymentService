package in.cper.backend.repository;

import in.cper.backend.entity.CustomUserDetailsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomUserRepository extends JpaRepository<CustomUserDetailsEntity, Long> {
    Optional<CustomUserDetailsEntity> findByEmail(String email);
    Optional<CustomUserDetailsEntity> findByEmailIgnoreCase(String email);
    Optional<CustomUserDetailsEntity> findByGoogleSubject(String googleSubject);
}
