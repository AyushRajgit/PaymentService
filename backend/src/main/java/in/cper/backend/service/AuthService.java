package in.cper.backend.service;

import in.cper.backend.entity.CustomUserDetailsEntity;
import in.cper.backend.repository.CustomUserRepository;
import in.cper.backend.security.TokenService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {

    private final CustomUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    public AuthService(CustomUserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       TokenService tokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }

    public void registerUser(String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email is already registered");
        }

        CustomUserDetailsEntity newUser = new CustomUserDetailsEntity ();
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password));
        userRepository.save(newUser);
    }

    public String loginUser(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        return tokenService.generateToken(authentication);
    }

    @Transactional
    public String loginWithGoogle(OidcUser googleUser) {
        String email = googleUser.getAttribute("email");
        Boolean emailVerified = googleUser.getAttribute("email_verified");
        String googleSubject = googleUser.getSubject();

        if (email == null || email.isBlank() || !emailVerified
                || googleSubject == null || googleSubject.isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error(
                    "invalid_google_account",
                    "Google did not provide a verified email address.",
                    null
            ));
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        CustomUserDetailsEntity user = userRepository.findByGoogleSubject(googleSubject)
                .or(() -> userRepository.findByEmailIgnoreCase(normalizedEmail))
                .orElse(null);

        if (user == null) {
            user = new CustomUserDetailsEntity();
            user.setEmail(normalizedEmail);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setRole("ROLE_USER");
            user.setEnabled(true);
        }

        user.setGoogleSubject(googleSubject);
        userRepository.save(user);

        Authentication localAuthentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(), null, List.of()
        );
        return tokenService.generateToken(localAuthentication);
    }
}
