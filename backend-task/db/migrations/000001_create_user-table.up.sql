CREATE TABLE IF NOT EXISTS users(
	id SERIAL,	
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  phone_number VARCHAR(15) NOT NULL,
	is_admin BOOLEAN,
	PRIMARY KEY (id)
);
INSERT INTO users(name,email,password,phone_number,is_admin) VALUES('admin','johndoe@gmail.com','$2a$12$xMnb.EOaDDf1QWlaazbdv.pgd7181s09j7mopQK8SvwEFyBWzmPlW','254712345233',true);

INSERT INTO users(name,email,password,phone_number,is_admin) VALUES('brad','bread@gmail.com','$2a$10$zn898D1gDdL1O82LYWwB1u960x8ExOPtAIphu8bSK2WTVfqsxfD02','254712345233',false);
