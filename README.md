## PEACE

### Project TODOs (priority)
- [X] User management: support two roles (admin, member). Public registration with name, email, tel, and password. Login returns JWT; logout clears session. Protected routes via middleware.
- [X] Exhibition management: anyone can view exhibitions. After login, admin can create / update / delete exhibitions. New exhibitions must return an id. Start date must not be in the past.
- [X] Booth booking: after login, members can create bookings for any exhibition. New bookings return an id. Members can book multiple booths per event but a maximum of 6 booths per exhibition (big + small combined). Members can view/edit/delete their own bookings; admins can view/edit/delete any user's bookings.

### Additional features / effort estimate (example)
- [ ] CRUD pages/components
- [X] Search & Filter UI
- [X] Light/Dark theming
- [ ] User profile page
- [X] Responsive layout work
- [ ] Special UI or polish per screen

### Default users (for development)

#### Admin
```
username: admin
email: admin@admin.com
password: Secured1
role: admin
```

#### Member
```
username: peace
email: peace@gmail.com
password: Secured1
role: member
```

Notes
- The backend seeds these users when the users collection is empty (see `backend/seeds/seedUsers.js`). Passwords are hashed by the User model pre-save hook.
- Public registration on the frontend no longer allows selecting role; the server enforces `role: 'member'` for public signups.

### TODO by peace
- The exhibition page if booking it will subtract but if delete the bookings it not add back so logic may mismatch
- When user booking and it error this routing to next page. want to have error message

### CRITERIA CHECK
- [X] User Registration + Validation Check
- [X] User Log-in 
- [X] User View Product/Item
- [X] User Create Booking/Request/Order
- [ ] Check Create Condition 
- [X] User View Own Booking/Request/Order
- [ ] User Edit Own Booking/Request/Order
- [ ] User Delete Own Booking/Request/Order
- [X] User Log-out 
- [X] Admin Log-in
- [ ] Admin View Any Booking
- [ ] Admin Edit Any Booking 
- [X] Admin Delete Any Booking 
- [X] Admin Create New Product/Item
- [ ] Deploy
