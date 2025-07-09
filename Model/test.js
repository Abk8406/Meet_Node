const newUser = await User.create({
  name: "Abhishek",
  email: "testuser@email.com",
  password: "hashed_password",
  role_id: 1
});

const fetchedUser = await User.findOne({
  where: { id: newUser.id },
  include: [{ model: Role, as: 'role' }]
});

console.log(fetchedUser.toJSON());
