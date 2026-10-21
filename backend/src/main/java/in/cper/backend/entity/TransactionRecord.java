package in.cper.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import in.cper.backend.Enum.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class TransactionRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionRecordId;

    @Column(updatable = false, nullable = false)
    private String transactionId;

    @ManyToOne
    @JoinColumn(name = "sender_customerId")
    @JsonIgnore
    private CustomerEntity senderCustomer;

    @ManyToOne
    @JoinColumn(name = "receiver_customerId")
    @JsonIgnore
    private CustomerEntity receiverCustomer;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    private String senderName;
    private String receiverName;
    private String senderPhoneNumber;
    private String receiverPhoneNumber;
    private LocalDateTime dateAndTime;
    private String sendersBankName;
    private String receiversBankName;
    private BigDecimal amount;

    @PrePersist
    public void onCreate() {
        this.transactionId = UUID.randomUUID().toString();
        dateAndTime = LocalDateTime.now();
    }

    public TransactionRecord(CustomerEntity senderCustomer, CustomerEntity receiverCustomer, String senderName, String receiverName, String senderPhoneNumber, String receiverPhoneNumber, BigDecimal amount, PaymentStatus status, String sendersBankName, String receiversBankName) {
        this.senderCustomer = senderCustomer;
        this.receiverCustomer = receiverCustomer;
        this.senderName = senderName;
        this.receiverName = receiverName;
        this.senderPhoneNumber = senderPhoneNumber;
        this.receiverPhoneNumber = receiverPhoneNumber;
        this.amount = amount;
        this.paymentStatus = status;
        this.sendersBankName = sendersBankName;
        this.receiversBankName = receiversBankName;
    }
}
