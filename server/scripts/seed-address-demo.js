require('dotenv').config();

const {
	Province,
	District,
	Ward,
	userDb,
} = require('../services/user/user.db');

const provinces = [
	{
		provinceId: 1,
		name: 'Ha Noi',
		code: 'HN',
		districts: [
			{
				districtId: 1,
				name: 'Cau Giay',
				prefix: 'Quan',
				wards: [
					{ wardId: 1, name: 'Dich Vong Hau', prefix: 'Phuong' },
					{ wardId: 2, name: 'Nghia Tan', prefix: 'Phuong' },
				],
			},
			{
				districtId: 2,
				name: 'Ba Dinh',
				prefix: 'Quan',
				wards: [
					{ wardId: 3, name: 'Kim Ma', prefix: 'Phuong' },
					{ wardId: 4, name: 'Cong Vi', prefix: 'Phuong' },
				],
			},
		],
	},
	{
		provinceId: 2,
		name: 'Ho Chi Minh',
		code: 'HCM',
		districts: [
			{
				districtId: 3,
				name: 'Quan 1',
				prefix: 'Quan',
				wards: [
					{ wardId: 5, name: 'Ben Nghe', prefix: 'Phuong' },
					{ wardId: 6, name: 'Da Kao', prefix: 'Phuong' },
				],
			},
			{
				districtId: 4,
				name: 'Quan 7',
				prefix: 'Quan',
				wards: [
					{ wardId: 7, name: 'Tan Phong', prefix: 'Phuong' },
					{ wardId: 8, name: 'Phu My', prefix: 'Phuong' },
				],
			},
		],
	},
	{
		provinceId: 3,
		name: 'Da Nang',
		code: 'DN',
		districts: [
			{
				districtId: 5,
				name: 'Hai Chau',
				prefix: 'Quan',
				wards: [
					{ wardId: 9, name: 'Hai Chau 1', prefix: 'Phuong' },
					{ wardId: 10, name: 'Hai Chau 2', prefix: 'Phuong' },
				],
			},
			{
				districtId: 6,
				name: 'Thanh Khe',
				prefix: 'Quan',
				wards: [
					{ wardId: 11, name: 'An Khe', prefix: 'Phuong' },
					{ wardId: 12, name: 'Chinh Gian', prefix: 'Phuong' },
				],
			},
		],
	},
];

async function main() {
	await userDb.sync();

	for (const province of provinces) {
		await Province.upsert({
			provinceId: province.provinceId,
			name: province.name,
			code: province.code,
		});

		for (const district of province.districts) {
			await District.upsert({
				districtId: district.districtId,
				name: district.name,
				prefix: district.prefix,
				provinceId: province.provinceId,
			});

			for (const ward of district.wards) {
				await Ward.upsert({
					wardId: ward.wardId,
					name: ward.name,
					prefix: ward.prefix,
					districtId: district.districtId,
				});
			}
		}
	}

	console.log('Seeded demo address data.');
	await userDb.close();
}

main().catch(async (err) => {
	console.error(err);
	try {
		await userDb.close();
	} catch (_) {}
	process.exit(1);
});
