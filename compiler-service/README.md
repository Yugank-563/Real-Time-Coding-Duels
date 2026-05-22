# Isolated Compiler Service

A background queue processor built with BullMQ. Dequeues user submissions, spins up ephemeral secure Docker sandboxes with execution limits, parses verdicts, and updates score databases.
