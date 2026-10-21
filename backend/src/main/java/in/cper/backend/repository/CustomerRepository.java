package in.cper.backend.repository;

import in.cper.backend.entity.CustomerEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends CrudRepository<CustomerEntity, Long> {
    Optional<CustomerEntity> findByOwner_Email(String email);
}
