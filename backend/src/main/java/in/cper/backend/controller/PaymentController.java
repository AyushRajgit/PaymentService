package in.cper.backend.controller;

import in.cper.backend.dto.PaymentRequestDTO;
import in.cper.backend.dto.PaymentResponseDTO;
import in.cper.backend.service.TransferPayment;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/amazonPay/transferPayment")
public class PaymentController {

    private TransferPayment transferPayment;

    @Autowired
    public PaymentController(TransferPayment transferPayment) {
        this.transferPayment = transferPayment;
    }

    @PostMapping
    public ResponseEntity<PaymentResponseDTO> transferPayment(@Valid @RequestBody PaymentRequestDTO paymentRequestDTO, Authentication authentication) {
        PaymentResponseDTO paymentResponseDTO = transferPayment.pay(paymentRequestDTO, authentication.getName());
        return ResponseEntity.status(HttpStatus.OK).body(paymentResponseDTO);
    }
}
