class Counter:
    def __init__(self, start):
        self.value = start
    def increment(self):
        self.value = self.value + 1
    def get(self):
        return self.value

c = Counter(0)
c.increment()
c.increment()
result = c.get()
print(result)
