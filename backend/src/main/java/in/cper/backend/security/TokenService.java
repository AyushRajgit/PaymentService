package in.cper.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.Duration;
import java.util.List;

@Service
public class TokenService {

    private static final long MAX_EXPIRATION_MS = Duration.ofHours(24).toMillis();

    private final JwtEncoder jwtEncoder;
    private final long expiryTime;
    private final String jwtIssuer;
    private final String jwtAudience;

    public TokenService(
            JwtEncoder jwtEncoder,
            @Value("${jwt.expiration-ms}") long expiryTime,
            @Value("${jwt.issuer}") String jwtIssuer,
            @Value("${jwt.audience}") String jwtAudience) {
        if (expiryTime <= 0 || expiryTime > MAX_EXPIRATION_MS) {
            throw new IllegalArgumentException("JWT expiration must be greater than 0 and no more than 24 hours");
        }
        if (jwtIssuer.isBlank() || jwtAudience.isBlank()) {
            throw new IllegalArgumentException("JWT issuer and audience must not be blank");
        }
        this.jwtEncoder = jwtEncoder;
        this.expiryTime = expiryTime;
        this.jwtIssuer = jwtIssuer;
        this.jwtAudience = jwtAudience;
    }

    public String generateToken(Authentication authentication) {
        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(jwtIssuer)
                .audience(List.of(jwtAudience))
                .issuedAt(now)
                .expiresAt(now.plusMillis(expiryTime))
                .subject(authentication.getName())
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
