package in.cper.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class BankAccountDetailEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long bankAccountId;

    private String bankName;
    private String bankAccountNumber;
    private BigDecimal balance;

    @Embedded
    private AccountPassKey accountPassKey;

    @ManyToOne
    @JoinColumn(name = "customerId")
    @JsonIgnore
    private CustomerEntity customer;

    @PrePersist
    public void onCreation() {
        LocalDateTime now = LocalDateTime.now();

        if (accountPassKey != null) {
            accountPassKey.setCreatedDateTime(now);
            accountPassKey.setUpdatedDateTime(now);
        }
    }

    @PreUpdate
    public void onUpdate() {
        if (accountPassKey != null) {
            accountPassKey.setUpdatedDateTime(LocalDateTime.now());
        }
    }

    public BankAccountDetailEntity(String bankName, String bankAccountNumber, BigDecimal balance, AccountPassKey accountPassKey, CustomerEntity customer) {
        this.bankName = bankName;
        this.bankAccountNumber = bankAccountNumber;
        this.balance = balance;
        this.accountPassKey = accountPassKey;
        this.customer = customer;
        this.accountPassKey = accountPassKey;
    }
}
