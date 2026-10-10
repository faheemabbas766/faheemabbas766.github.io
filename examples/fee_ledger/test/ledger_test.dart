import 'dart:async';
import 'package:test/test.dart';
import 'package:fee_ledger_example/ledger.dart';
import 'package:fee_ledger_example/ledger_cubit.dart';

class Delayed implements LedgerRepository {
  final done = Completer<Ledger>();
  int calls = 0;
  @override
  Future<Ledger> load() {
    calls++;
    return done.future;
  }

  @override
  Future<Ledger> pay(int amount, String retryId) => load();
}

void main() {
  late MemoryLedgerRepository repo;
  late LedgerCubit cubit;
  setUp(() {
    repo = MemoryLedgerRepository(const Ledger(10000, 2000));
    cubit = LedgerCubit(repo);
  });
  tearDown(() => cubit.close());
  test('loading and success states carry the balance', () async {
    final states = <LedgerState>[];
    final sub = cubit.stream.listen(states.add);
    await cubit.load();
    await Future<void>.delayed(Duration.zero);
    expect(states.map((s) => s.runtimeType), [Loading, Ready]);
    expect((cubit.state as Ready).ledger.outstanding, 8000);
    await sub.cancel();
  });
  test('partial payment decreases balance', () async {
    await cubit.pay(3000, 'a');
    expect((cubit.state as Ready).ledger.outstanding, 5000);
  });
  test('retry does not double charge', () async {
    await cubit.pay(3000, 'a');
    await cubit.pay(3000, 'a');
    expect(repo.ledger.paid, 5000);
  });
  test('changed payload cannot reuse retry identity', () async {
    await cubit.pay(3000, 'a');
    await cubit.pay(4000, 'a');
    expect(cubit.state, isA<Failed>());
    expect(repo.ledger.paid, 5000);
  });
  test('zero negative and missing ID payments preserve last state', () async {
    await cubit.load();
    for (final amount in [0, -1]) {
      await cubit.pay(amount, 'a');
      expect((cubit.state as Failed).previous!.paid, 2000);
    }
    await cubit.pay(1000, ' ');
    expect(cubit.state, isA<Failed>());
  });
  test('overpayment rejected without mutation', () async {
    await cubit.pay(9000, 'a');
    expect(cubit.state, isA<Failed>());
    expect(repo.ledger.paid, 2000);
  });
  test('closed period rejects payment', () async {
    repo.ledger = const Ledger(10000, 2000, closed: true);
    await cubit.pay(1000, 'a');
    expect(cubit.state, isA<Failed>());
    expect(repo.ledger.paid, 2000);
  });
  test('network error produces recoverable failure', () async {
    final r = Delayed();
    final c = LedgerCubit(r);
    final request = c.load();
    r.done.completeError(StateError('network'));
    await request;
    expect((c.state as Failed).message, contains('Retry'));
    await c.close();
  });
  test('concurrent requests are gated', () async {
    final r = Delayed();
    final c = LedgerCubit(r);
    final request = c.load();
    await c.load();
    expect(r.calls, 1);
    r.done.complete(const Ledger(100, 0));
    await request;
    await c.close();
  });
  test('disposal during request does not emit after close', () async {
    final r = Delayed();
    final c = LedgerCubit(r);
    final request = c.load();
    await c.close();
    r.done.complete(const Ledger(100, 0));
    await request;
  });
}
