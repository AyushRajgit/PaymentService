package in.cper.backend.entity;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class AccountPassKey {
    private Long passKey;
    private LocalDateTime createdDateTime;
    private LocalDateTime updatedDateTime;

    public AccountPassKey(Long passKey) {
        this.passKey = passKey;
    }

}
