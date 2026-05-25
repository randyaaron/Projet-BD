<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Http\Requests\Secretary\StorePaymentRequest;
use App\Models\Payment;
use App\Models\Receipt;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::query()->with(['student.person', 'receipt'])->latest('id');

        if ($request->filled('student_id')) {
            $query->where('student_id', (int) $request->input('student_id'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(StorePaymentRequest $request)
    {
        $payment = Payment::create([
            'student_id' => (int) $request->input('student_id'),
            'amount' => $request->input('amount'),
            'paid_at' => $request->input('paid_at') ?: now(),
            'method' => $request->input('method', 'cash'),
            'reason' => $request->input('reason'),
            'reference' => $request->input('reference'),
            'recorded_by_user_id' => $request->user()->id,
        ]);

        // Après paiement: l’élève devient "PAID" si en attente
        /** @var Student|null $student */
        $student = $payment->student()->first();
        if ($student && $student->status === 'PENDING_PAYMENT') {
            $student->forceFill(['status' => 'PAID'])->save();
        }

        return response()->json(['payment' => $payment->load(['student.person'])], 201);
    }

    public function generateReceipt(Request $request, Payment $payment)
    {
        $receipt = Receipt::query()->firstOrCreate(
            ['payment_id' => $payment->id],
            [
                'receipt_number' => 'RC-' . strtoupper(Str::random(10)),
                'generated_at' => now(),
            ]
        );

        return response()->json(['receipt' => $receipt]);
    }
}

