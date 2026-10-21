package in.cper.backend.repository;

import in.cper.backend.entity.BankAccountDetailEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccountDetailEntity, Long> {

    Optional<BankAccountDetailEntity> findByBankAccountNumber(String sendersBankAccountNumber);

    Optional<BankAccountDetailEntity> findByBankAccountNumberAndCustomer_Owner_Email(String bankAccountNumber, String email);

    Optional<BankAccountDetailEntity> findByBankAccountIdAndCustomer_CustomerId(Long bankAccountId, Long customerId);

}
