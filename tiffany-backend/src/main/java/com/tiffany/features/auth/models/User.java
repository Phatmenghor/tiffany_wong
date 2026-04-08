package com.tiffany.features.auth.models;

import com.tiffany.enums.common.Status;
import com.tiffany.enums.user.AccountStatus;
import com.tiffany.enums.user.UserType;
import com.tiffany.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_identifier", columnNames = {"user_identifier"})
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"profile"})
@ToString(exclude = {"profile"})
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseUUIDEntity {

    // ── Core ──────────────────────────────────────────────────────────────────

    @Column(name = "user_identifier", nullable = false)
    private String userIdentifier;

    @Column(name = "password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false)
    private UserType userType;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    // Platform-level enable/disable (managed by platform admin)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.ACTIVE;

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;

    // ── Profile (separate table) ───────────────────────────────────────────

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserProfile profile;

    // ── Helpers ───────────────────────────────────────────────────────────────

    public String getFullName() {
        if (profile != null) {
            String name = profile.getFullName();
            if (name != null) return name;
        }
        return userIdentifier;
    }

    public boolean isActive() { return AccountStatus.ACTIVE.equals(accountStatus); }
    public boolean isOwner() { return UserType.OWNER.equals(userType); }
    public boolean isCustomer() { return UserType.CUSTOMER.equals(userType); }
}
