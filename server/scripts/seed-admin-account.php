<?php

function parseEnvFile(string $path): array
{
	if (!file_exists($path)) {
		return [];
	}

	$lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
	$result = [];
	foreach ($lines as $line) {
		$line = trim($line);
		if ($line === '' || str_starts_with($line, '#')) {
			continue;
		}
		$parts = explode('=', $line, 2);
		if (count($parts) === 2) {
			$key = trim($parts[0]);
			$value = trim($parts[1]);
			$value = trim($value, "\"'");
			$result[$key] = $value;
		}
	}
	return $result;
}

$env = parseEnvFile(__DIR__ . '/../.env');
$host = $env['MYSQL_HOSTNAME'] ?? 'localhost';
$user = $env['MYSQL_USERNAME'] ?? 'root';
$pass = $env['MYSQL_PASSWORD'] ?? '';
$dbName = $env['INTERNAL_SERVICE_DB_NAME'] ?? 'internal_service';

$username = $argv[1] ?? '';
$password = $argv[2] ?? '';

if ($username === '' || $password === '') {
	echo "Usage: php scripts/seed-admin-account.php <username> <password>\n";
	exit(1);
}

try {
	$dsn = "mysql:host=$host;dbname=$dbName;charset=utf8mb4";
	$pdo = new PDO($dsn, $user, $pass, [
		PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
	]);

	$hashPwd = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
	$now = date('Y-m-d H:i:s');

	$stmt = $pdo->prepare('SELECT accountId FROM adminAccounts WHERE username = ? LIMIT 1');
	$stmt->execute([$username]);
	$existing = $stmt->fetch(PDO::FETCH_ASSOC);

	if ($existing) {
		$update = $pdo->prepare('UPDATE adminAccounts SET password = ?, updatedAt = ? WHERE accountId = ?');
		$update->execute([$hashPwd, $now, $existing['accountId']]);
		echo "Updated admin account: $username\n";
	} else {
		$insert = $pdo->prepare(
			'INSERT INTO adminAccounts (username, password, peopleId, address, position, status, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?)',
		);
		$insert->execute([
			$username,
			$hashPwd,
			'000000000000',
			'Demo address',
			1,
			1,
			$now,
			$now,
		]);
		echo "Created admin account: $username\n";
	}
} catch (Throwable $e) {
	echo "Seed failed: " . $e->getMessage() . "\n";
	exit(1);
}
