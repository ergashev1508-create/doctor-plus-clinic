# Firestore Security Specification

## 1. Data Invariants
- **Doctors**: Publicly readable. Only admins can create/update.
- **Reviews**: Publicly readable. Patients can create for specific doctors.
- **Bookings**: Only admin or the booking owner (based on phone/email verification) can read. Only patients can create (initially). Status change restricted.
- **Patients**: Private to admin. Patients can see their own data? (Maybe via phone verification).
- **Notifications**: Only admins can read/update (mark as read).
- **Settings**: System-wide settings. Publicly readable, admin only write.
- **Admins**: Private. Only admins can read (to verify other admins).

## 2. The "Dirty Dozen" Payloads (Red Team Test)

### 1. Identity Spoofing (Review)
```json
{
  "author": "Hackerman",
  "rating": 5,
  "text": "Great doctor!",
  "date": "2024-01-01",
  "source": "Google"
}
```
*Expected Result*: PERMISSION_DENIED (Must be 'Новый' for new reviews if created via client).

### 2. Identity Spoofing (Booking)
```json
{
  "doctorId": "doc1",
  "patientPhone": "+996555123456",
  "status": "Подтверждена"
}
```
*Expected Result*: PERMISSION_DENIED (Initial status must be 'Новая').

### 3. Resource Poisoning (Doctor ID)
`doc_ID_too_long_1234567890_1234567890_1234567890_1234567890_1234567890_1234567890_1234567890_1234567890_1234567890`
*Expected Result*: PERMISSION_DENIED (isValidId size check).

### 4. Admin Privilege Escalation
```json
{
  "email": "attacker@gmail.com",
  "username": "superadmin"
}
```
*Expected Result*: PERMISSION_DENIED (Writing to /admins).

### 5. Shadow Update (Doctor Rating)
```json
{
  "rating": 5.0,
  "hidden_field": "unauthorized"
}
```
*Expected Result*: PERMISSION_DENIED (affectedKeys.hasOnly).

### 6. PII Leak (Patient Search)
`list /patients`
*Expected Result*: PERMISSION_DENIED (Only admins can list).

### 7. Ghost Field Injection (Booking)
```json
{
  "doctorId": "doc1",
  "isVerified": true
}
```
*Expected Result*: PERMISSION_DENIED (Strict schema validation).

### 8. Denial of Wallet (Giant String)
```json
{
  "text": "A".repeat(1000000)
}
```
*Expected Result*: PERMISSION_DENIED (Size check in isValidReview).

### 9. Price Manipulation (Booking)
```json
{
  "price": 0
}
```
*Expected Result*: PERMISSION_DENIED (Price must be >= 1000).

### 10. Status Jump (Booking)
Updating status from 'Новая' to 'Завершена' directly by non-admin.
*Expected Result*: PERMISSION_DENIED.

### 11. Orphaned Write (Booking for non-existent Doctor)
Creating booking with `doctorId: "non_existent"`
*Expected Result*: PERMISSION_DENIED (exists() check).

### 12. Self-Role Assignment (User Profile)
```json
{
  "role": "admin"
}
```
*Expected Result*: PERMISSION_DENIED (Immutable or restricted fields).
