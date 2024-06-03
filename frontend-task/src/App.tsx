import "./App.css";
import { useQuery } from "@tanstack/react-query";
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
} from "@chakra-ui/react";
import { useState } from "react";
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
	const [currName, setCurrName] = useState<string | undefined>(undefined);
	const [currId, setCurrId] = useState<number | undefined>(undefined);
	const [currEmail, setCurrEmail] = useState<string | undefined>(undefined);
	const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
	const [currPhoneNumber, setCurrPhoneNumber] = useState<string | undefined>(
		undefined,
	);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const usersQuery = useQuery({
		queryKey: ["users"],
		queryFn: async () => {
			const res = await fetch("http://localhost:3000/users");
			const data = await res.json();
			return data.users as Array<User>;
		},
	});
	console.log(searchQuery)
	return (
		<>
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Modal Title</ModalHeader>
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
								setCurrId(undefined);
								setCurrEmail(undefined);
								setCurrPhoneNumber(undefined);
								setCurrName(undefined);
							}}
						>
							Close
						</Button>
						<Button colorScheme="green">Confirm</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
			<div className="join">
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
						{usersQuery.data?.filter((user) => user.name.includes(searchQuery ?? "")).map((user: User, index: number) => {
							return (
								<tr
									key={index}
									onClick={() => {
										setCurrName(user.name);
										setCurrPhoneNumber(user.phone_number);
										setCurrEmail(user.email);
										setCurrId(user.id);
										onOpen();
									}}
								>
									<th>{index + 1}</th>
									<td>{user.name}</td>
									<td>{user.email}</td>
									<td>{user.company}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</>
	);
}

export default App;
