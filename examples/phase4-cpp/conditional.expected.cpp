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
    auto x = 50;
    auto y = (x > 40 ? 1 : 0);
    std::cout << y << "\n";
    auto inRange = [&]{ auto __m0 = x; return (__m0 >= 1 && __m0 <= 100); }();
    std::cout << inRange << "\n";
    return 0;
}
