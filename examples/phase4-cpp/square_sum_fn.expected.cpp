#include <iostream>
#include <vector>
#include <cmath>

// eml_pow: integer exponentiation for the EML power form i^n (n >= 1).
template <class B>
static long long eml_pow(B base, long long exp) {
    long long r = 1;
    long long b = static_cast<long long>(base);
    for (long long k = 0; k < exp; ++k) r *= b;
    return r;
}

auto square_sum(auto N) {
    auto r = [&]{ long long __sum0 = 0; for (long long i = 1; i <= N; ++i) __sum0 += eml_pow(i, 2); return __sum0; }();
    return r;
}

int main() {
    auto total = square_sum(100);
    std::cout << total << "\n";
    return 0;
}
