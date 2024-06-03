import "./App.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	FormControl,
	FormLabel,
	Input,
	Button,
	useDisclosure,
	useToast,
	Checkbox,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "react-router-dom";
interface User {
	id: number;
	name: string;
	email: string;
	password: string;
	company: string;
	phone_number: string;
	is_admin: boolean;
}
function App() {
	const queryClient = useQueryClient();
	const [currName, setCurrName] = useState<string | undefined>(undefined);
	const [name, setName] = useState<string | undefined>(undefined);
	const [isAdmin, setIsAdmin] = useState(false);
	const [company, setCompany] = useState<string | undefined>(undefined);
	const [email, setEmail] = useState<string | undefined>(undefined);
	const [password, setPassword] = useState<string | undefined>(undefined);
	const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
	const [currId, setCurrId] = useState<number | undefined>(undefined);
	const [currEmail, setCurrEmail] = useState<string | undefined>(undefined);
	const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
	const [currPhoneNumber, setCurrPhoneNumber] = useState<string | undefined>(
		undefined,
	);
	const [page, setPage] = useState(1);
	const toast = useToast();
	const { isOpen, onOpen, onClose } = useDisclosure();
	function paginate(array: Array<User>, page_size: number, page_number: number) {
		// human-readable page numbers usually start with 1, so we reduce 1 in the first argument
		return array.slice((page_number - 1) * page_size, page_number * page_size);
	}
	const {
		isOpen: isOpenNewUSer,
		onOpen: onOpenNewUser,
		onClose: onCloseNewUser,
	} = useDisclosure();
	const usersQuery = useQuery({
		//Fetch users
		queryKey: ["users"],
		queryFn: async () => {
			const res = await fetch("http://localhost:3000/users");
			const data = await res.json();
			return data.users as Array<User>;
		},
	});
	console.log({ currName, currId, currPhoneNumber, currEmail });
	console.log(searchQuery);
	return (
		<>
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>edit user</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<FormControl>
							<FormLabel>Email address</FormLabel>
							<Input
								onChange={(e) => {
									setCurrEmail(e.target.value);
								}}
								value={currEmail}
								type="email"
							/>
						</FormControl>

						<FormControl>
							<FormLabel>Name</FormLabel>
							<Input
								onChange={(e) => {
									setCurrName(e.target.value);
								}}
								value={currName}
								type="email"
							/>
						</FormControl>

						<FormControl>
							<FormLabel>Phone Number</FormLabel>
							<Input
								onChange={(e) => {
									setCurrPhoneNumber(e.target.value);
								}}
								value={currPhoneNumber}
								type="email"
							/>
						</FormControl>
					</ModalBody>

					<ModalFooter>
						<Button
							variant="ghost"
							mr={3}
							onClick={() => {
								onClose();
								setCurrEmail(undefined);
								setCurrPhoneNumber(undefined);
								setCurrName(undefined);
							}}
						>
							Close
						</Button>
						<Button
							colorScheme="green"
							onClick={async () => {
								try {
									//Edit user
									if (localStorage.getItem("isAdmin") == "true") {
										const res = await fetch(
											`http://localhost:3000/users/${currId}`,
											{
												method: "PUT",
												headers: {
													"Content-Type": "application/json",
													Authorization: `${localStorage.getItem("token")}`,
												},
												body: JSON.stringify({
													email: currEmail,
													phoneNumber: currPhoneNumber,
													name: currName,
												}),
											},
										);
										const data = await res.json();
										if (data.status == "Updated successfully") {
											toast({ description: "Updated", status: "success" });
											queryClient.invalidateQueries({ queryKey: ["users"] });
											onClose();
										} else {
											toast({ description: data.status, status: "error" });
										}
									} else {
										toast({
											description: "Not an administrator",
											status: "error",
										});
									}
								} catch (e) {
									toast({ description: "Error updating", status: "error" });
								}
							}}
						>
							Confirm
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
			<Modal isOpen={isOpenNewUSer} onClose={onCloseNewUser}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Create new user</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<FormControl>
							<FormLabel>Email address</FormLabel>
							<Input
								onChange={(e) => {
									setEmail(e.target.value);
								}}
								value={email}
								type="email"
							/>
						</FormControl>

						<FormControl>
							<FormLabel>Name</FormLabel>
							<Input
								onChange={(e) => {
									setName(e.target.value);
								}}
								value={name}
								type="text"
							/>
						</FormControl>

						<FormControl>
							<FormLabel>Phone Number</FormLabel>
							<Input
								onChange={(e) => {
									setPhoneNumber(e.target.value);
								}}
								type="text"
								value={phoneNumber}
							/>
						</FormControl>
						<FormControl>
							<FormLabel>Password</FormLabel>
							<Input
								onChange={(e) => {
									setPassword(e.target.value);
								}}
								type="text"
								value={password}
							/>
						</FormControl>
						<FormControl>
							<FormLabel>Company</FormLabel>
							<Input
								onChange={(e) => {
									setCompany(e.target.value);
								}}
								type="text"
								value={company}
							/>
						</FormControl>
						<FormControl>
							<FormLabel>is Admin</FormLabel>
							<Checkbox
								onChange={(e) => {
									setIsAdmin(e.target.checked);
								}}
								type="text"
								checked={isAdmin}
							/>
						</FormControl>
					</ModalBody>

					<ModalFooter>
						<Button
							variant="ghost"
							mr={3}
							onClick={() => {
								onCloseNewUser();
								setCurrEmail(undefined);
								setCurrPhoneNumber(undefined);
								setCurrName(undefined);
							}}
						>
							Close
						</Button>
						<Button
							colorScheme="green"
							onClick={async () => {
								try {
									//Create new user
									if (localStorage.getItem("isAdmin") == "true") {
										const res = await fetch(`http://localhost:3000/users`, {
											method: "POST",
											headers: {
												"Content-Type": "application/json",
												Authorization: `${localStorage.getItem("token")}`,
											},
											body: JSON.stringify({
												email,
												phoneNumber,
												name,
												company,
												password,
												isAdmin,
											}),
										});
										const data = await res.json();
										if (data.status == "success") {
											toast({ description: "User created", status: "success" });
											queryClient.invalidateQueries({ queryKey: ["users"] });
											onClose();
										} else {
											toast({ description: data.status, status: "error" });
										}
									} else {
										toast({
											description: "Not an administrator",
											status: "error",
										});
									}
								} catch (e) {
									toast({
										description: "Error Creating new user",
										status: "error",
									});
								}
							}}
						>
							Confirm
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			<div className="flex flex-row items-center">
				<div className="join m-2">
					<input
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
						}}
						className="input input-bordered join-item"
						placeholder="Name"
					/>
					<button className="btn join-item rounded-r-full">Search</button>
				</div>
				<Button
					className="m-2"
					onClick={() => {
						onOpenNewUser();
					}}
				>
					Create new User
				</Button>
				<Link to="login" className="btn">login</Link>
			</div>
			<div className="overflow-x-auto">
				<table className="table">
					{/* head */}
					<thead>
						<tr>
							<th></th>
							<th>Name</th>
							<th>Email</th>
							<th>Company</th>
						</tr>
					</thead>
					<tbody>
						{	//paginate user array by page size of 5 after filtering by name
							paginate(usersQuery.data
								?.filter((user) => user.name.includes(searchQuery ?? "")) ?? new Array<User>(), 5, page)
								.map((user: User, index: number) => {
									return (
										<>
											<tr
												key={index}
												onClick={() => {
													setCurrId(user.id);
													setCurrName(user.name);
													setCurrPhoneNumber(user.phone_number);
													setCurrEmail(user.email);
													onOpen();
												}}
											>
												<th>{index + 1}</th>
												<td>{user.name}</td>
												<td>{user.email}</td>
												<td>{user.company}</td>
											</tr>

											<Button
												size="xs"
												colorScheme="blue"
												aria-label="Search database"
												onClick={async () => {
													try {
														//DELETE user
														if (localStorage.getItem("isAdmin") == "true") {
															const res = await fetch(
																`http://localhost:3000/user/${user.id}`,
																{ method: "DELETE" },
															);
															const data = await res.json();
															if (data.status == "success") {
																toast({
																	description: "Deleted",
																	status: "success",
																});
																queryClient.invalidateQueries({
																	queryKey: ["users"],
																});
															} else {
																toast({
																	description: "Error Deleting",
																	status: "error",
																});
															}
														} else {
															toast({
																description: "Not an administrator",
																status: "error",
															});
														}
													} catch (e) {
														console.error(e);

														toast({
															description: "Error Deleting",
															status: "error",
														});
													}
												}}
											>
												{" "}
												delete
											</Button>
										</>
									);
								})}
					</tbody>
				</table>
				<div className="join">
					<button
						className="join-item btn"
						onClick={() => {
							if (page !== 1) {
								setPage((page) => page - 1);
							}
						}}
					>
						«

					</button>

					<button className="join-item btn">Page {page}</button>
					<button
						className="join-item btn"
						onClick={() => {
							setPage((page) => page + 1);
						}}
					>
						»
					</button>
				</div>{" "}
			</div>
		</>
	);
}

export default App;
