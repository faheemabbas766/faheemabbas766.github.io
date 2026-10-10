import 'package:bloc/bloc.dart';
import 'ledger.dart';

sealed class LedgerState {
  const LedgerState();
}

class Initial extends LedgerState {
  const Initial();
}

class Loading extends LedgerState {
  const Loading();
}

class Ready extends LedgerState {
  const Ready(this.ledger);
  final Ledger ledger;
}

class Failed extends LedgerState {
  const Failed(this.message, this.previous);
  final String message;
  final Ledger? previous;
}

class LedgerCubit extends Cubit<LedgerState> {
  LedgerCubit(this.repository) : super(const Initial());
  final LedgerRepository repository;
  Ledger? _last;
  bool _busy = false;
  Future<void> load() => _run(repository.load);
  Future<void> pay(int amount, String retryId) =>
      _run(() => RecordPayment(repository)(amount, retryId));
  Future<void> _run(Future<Ledger> Function() action) async {
    if (_busy || isClosed) return;
    _busy = true;
    emit(const Loading());
    try {
      final result = await action();
      _last = result;
      if (!isClosed) emit(Ready(result));
    } on PaymentRejected catch (e) {
      if (!isClosed) emit(Failed(e.message, _last));
    } catch (_) {
      if (!isClosed) {
        emit(Failed('Update failed. Retry with the same payment ID.', _last));
      }
    } finally {
      _busy = false;
    }
  }
}
