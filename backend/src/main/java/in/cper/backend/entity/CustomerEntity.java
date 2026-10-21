package in.cper.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class CustomerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long customerId;

    private String firstName;
    private String lastName;
    private String phoneNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private CustomUserDetailsEntity owner;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private Set<BankAccountDetailEntity> bankAccounts = new HashSet<>();

    @OneToMany(mappedBy = "senderCustomer", cascade = CascadeType.ALL)
    private Set<TransactionRecord> sentTransactions = new HashSet<>();

    @OneToMany(mappedBy = "receiverCustomer", cascade = CascadeType.ALL)
    private Set<TransactionRecord> receivedTransactions = new HashSet<>();

    public CustomerEntity(String firstName, String lastName, String phoneNumber, Set<BankAccountDetailEntity> bankAccounts) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.bankAccounts = bankAccounts;
    }
}
