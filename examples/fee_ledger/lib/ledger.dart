class Ledger {
  const Ledger(this.billed, this.paid, {this.closed = false});
  final int billed; // Integer minor currency units.
  final int paid;
  final bool closed;
  int get outstanding => billed - paid;
}

abstract interface class LedgerRepository {
  Future<Ledger> load();
  Future<Ledger> pay(int amount, String retryId);
}

class PaymentRejected implements Exception {
  const PaymentRejected(this.message);
  final String message;
}

class RecordPayment {
  const RecordPayment(this.repository);
  final LedgerRepository repository;
  Future<Ledger> call(int amount, String retryId) {
    if (amount <= 0 || retryId.trim().isEmpty) {
      throw const PaymentRejected('Positive amount and retry ID required.');
    }
    return repository.pay(amount, retryId);
  }
}

// Single-process demonstration adapter, not production storage.
class MemoryLedgerRepository implements LedgerRepository {
  MemoryLedgerRepository(this.ledger);
  Ledger ledger;
  final Map<String, int> _requests = {};
  @override
  Future<Ledger> load() async => ledger;
  @override
  Future<Ledger> pay(int amount, String retryId) async {
    if (_requests.containsKey(retryId)) {
      if (_requests[retryId] != amount) {
        throw const PaymentRejected('Retry ID belongs to a different payment.');
      }
      return ledger;
    }
    if (ledger.closed) throw const PaymentRejected('Ledger is closed.');
    if (amount <= 0 || amount > ledger.outstanding) {
      throw const PaymentRejected('Invalid payment amount.');
    }
    ledger = Ledger(ledger.billed, ledger.paid + amount);
    _requests[retryId] = amount;
    return ledger;
  }
}
