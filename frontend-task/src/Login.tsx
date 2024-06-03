import {
	FormControl,
	FormLabel,
	Input,
	Button,
	InputGroup,
	InputRightElement,
	Flex,
	useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
	const [show, setShow] = useState(false);
	const [password, setPassword] = useState<string | undefined>(undefined);
	const toast = useToast();
	const navigate = useNavigate();
	const [email, setEmail] = useState<string | undefined>(undefined);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		try {
			//login user
			e.preventDefault();
			setIsSubmitting(true);
			console.log({ password, email });
			const res = await fetch("http://localhost:3000/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();
			if (data.status == "success") {
				setIsSubmitting(false);
				toast({ description: "Logged in", status: "success" });
				//save JWT token to browser local storage for use in headers for authentication
				localStorage.removeItem("token");
				localStorage.removeItem("isAdmin")
				localStorage.setItem("token", data.token);
				localStorage.setItem("isAdmin", data.isAdmin)
				navigate("/");
			} else if (data.status == "credential miss match") {
				setIsSubmitting(false);
				toast({ description: data.status, status: "error" });
			} else {

				setIsSubmitting(false);
				toast({ description: "Error logging in", status: "error" });
			}
		} catch (e) {

			setIsSubmitting(false);
			console.error(e)
			toast({ description: "Error logging in", status: "error" });
		}
	}
	const handleClick = () => setShow(!show);//toogle password visibility
	return (
		<form onSubmit={onSubmit}>
			<FormControl mt={4}>
				<FormLabel htmlFor="name">Email</FormLabel>
				<Input
					value={email}
					onChange={(e) => {
						setEmail(e.target.value);
					}}
					placeholder="Enter Email"
				/>
			</FormControl>

			<FormControl mt={4}>
				<FormLabel htmlFor="name">Password</FormLabel>
				<InputGroup size="md">
					<Input
						value={password}
						onChange={(e) => {
							setPassword(e.target.value);
						}}
						pr="4.5rem"
						type={show ? "text" : "password"}
						placeholder="Enter password"
					/>
					<InputRightElement width="4.5rem">
						<Button h="1.75rem" size="sm" onClick={handleClick}>
							{show ? "hide" : "show"}
						</Button>
					</InputRightElement>
				</InputGroup>{" "}
			</FormControl>
			<Flex>
				<Button
					mb={3}
					bgColor="#285430"
					type="submit"
					isLoading={isSubmitting}
					loadingText={"Signing you in"}
					variant="solid"
					color="#FFFFFF"
				>
					Sign in
				</Button>
			</Flex>
		</form>
	);
}
