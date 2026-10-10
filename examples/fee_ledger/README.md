# Fee ledger Cubit engineering sample

New standalone Dart example created October 2026 to demonstrate Cubit state transitions, repository injection, a validation use case and meaningful tests. This is a new portfolio example, not the production Hostel Manager implementation or evidence of historical client work.

Run with Dart 3.3+ (also bundled with Flutter):

```sh
dart pub get
dart analyze
dart test
```

Domain types and repository contract are in `lib/ledger.dart`; state orchestration is in `lib/ledger_cubit.dart`. Tests exercise loading/success/error, partial payments, duplicate retries, conflicting payloads, invalid amounts, closed periods, network failure, concurrent requests and disposal. Money uses integer minor units.

The in-memory adapter is single-process demo storage. Real persistence must enforce authorization, atomic balances and durable retry IDs server-side. The Cubit ignores overlapping actions while busy, so a UI should disable payment controls. No Flutter UI, real payment gateway, distributed guarantees or production backend is claimed. No private client source or resident data is included.
