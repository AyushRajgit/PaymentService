package in.cper.backend.repository;

import in.cper.backend.entity.TransactionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionRecord, Long> {

    List<TransactionRecord> findBySenderCustomer_CustomerId(Long customerId);
    List<TransactionRecord> findByReceiverCustomer_CustomerId(Long customerId);

    Page<TransactionRecord> findBySenderCustomer_CustomerIdOrReceiverCustomer_CustomerId(
            Long senderCustomerId, Long receiverCustomerId, Pageable pageable);
}
