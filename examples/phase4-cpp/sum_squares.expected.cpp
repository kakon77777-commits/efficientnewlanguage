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

int main() {
    auto N = 100;
    auto r = [&]{ long long __sum0 = 0; for (long long i = 1; i <= N; ++i) __sum0 += eml_pow(i, 2); return __sum0; }();
    std::cout << r << "\n";
    return 0;
}
