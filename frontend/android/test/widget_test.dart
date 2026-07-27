import 'package:flutter_test/flutter_test.dart';
import 'package:hi_docs/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const FormMakerApp());
  });
}
