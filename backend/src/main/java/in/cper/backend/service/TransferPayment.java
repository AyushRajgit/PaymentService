package in.cper.backend.service;

import in.cper.backend.Enum.PaymentStatus;
import in.cper.backend.dto.PaymentRequestDTO;
import in.cper.backend.dto.PaymentResponseDTO;
import in.cper.backend.dtoMapper.PaymentMapper;
import in.cper.backend.entity.BankAccountDetailEntity;
import in.cper.backend.entity.TransactionRecord;
import in.cper.backend.exceptions.InsufficientBalance;
import in.cper.backend.exceptions.UserAccountNotFound;
import in.cper.backend.exceptions.WrongPassKeyException;
import in.cper.backend.repository.BankAccountRepository;
import in.cper.backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TransferPayment {

    private TransactionRepository transactionRepository;
    private BankAccountRepository bankAccountRepository;
    private PaymentMapper paymentMapper;

    @Autowired
    public TransferPayment(TransactionRepository transactionRepository, BankAccountRepository bankAccountRepository, PaymentMapper paymentMapper) {
        this.transactionRepository = transactionRepository;
        this.bankAccountRepository = bankAccountRepository;
        this.paymentMapper = paymentMapper;
    }

    @Transactional
    public PaymentResponseDTO pay(PaymentRequestDTO paymentRequestDTO, String authenticatedEmail) {
        if (paymentRequestDTO.getAmount() == null || paymentRequestDTO.getAmount().signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment amount must be positive");
        }

        BankAccountDetailEntity senderBankDetails = validateSenderAccount(
                paymentRequestDTO.getSendersBankAccountNumber(), authenticatedEmail);
        BankAccountDetailEntity recipientBankDetails = validateAccount(paymentRequestDTO.getRecipientsBankAccountNumber());

        transactionPossible(senderBankDetails, recipientBankDetails, paymentRequestDTO);

        return paymentMapper.paymentMapper(senderBankDetails,recipientBankDetails);
    }

    private BankAccountDetailEntity validateAccount(String accountNumber) {
        return bankAccountRepository.findByBankAccountNumber(accountNumber).orElseThrow(
                () -> new UserAccountNotFound("No user found with Account-No : " + accountNumber)
        );
    }

    private BankAccountDetailEntity validateSenderAccount(String accountNumber, String authenticatedEmail) {
        return bankAccountRepository.findByBankAccountNumberAndCustomer_Owner_Email(accountNumber, authenticatedEmail).orElseThrow(
                () -> new UserAccountNotFound("Sender account not found for authenticated user")
        );
    }

    private void transactionPossible(BankAccountDetailEntity senderBankDetails, BankAccountDetailEntity recipientBankDetails, PaymentRequestDTO paymentRequestDTO) {
        if (senderBankDetails.getAccountPassKey().getPassKey().compareTo(paymentRequestDTO.getPassKey()) != 0) {
            throw new WrongPassKeyException("Provided passkey for transaction doesn't match the existing one");
        }

        if (senderBankDetails.getBalance().compareTo(paymentRequestDTO.getAmount()) <= 0) {
            throw new InsufficientBalance("InsufficientBalance : current balance is less than the amount to be send");
        }

        senderBankDetails.setBalance(senderBankDetails.getBalance().subtract(paymentRequestDTO.getAmount()));
        recipientBankDetails.setBalance(recipientBankDetails.getBalance().add(paymentRequestDTO.getAmount()));

        transactionRepository.save(new TransactionRecord(senderBankDetails.getCustomer(), recipientBankDetails.getCustomer(), senderBankDetails.getBankName(), recipientBankDetails.getBankName(), senderBankDetails.getCustomer().getPhoneNumber(), recipientBankDetails.getCustomer().getPhoneNumber(), paymentRequestDTO.getAmount(), PaymentStatus.SUCCESS, senderBankDetails.getBankName(), recipientBankDetails.getBankName()));
        bankAccountRepository.saveAndFlush(senderBankDetails);
    }

}
