import express from "express";
import { promises as fs } from "fs";

const { readFile, writeFile } = fs;

const router = express.Router();

/* Atividade 1 - Crie um endpoint para criar uma grade */ 
router.post("/", async (req, res) => {
    try {
        let grade = req.body;

        if(!grade.student || !grade.subject || !grade.type || grade.value == null) {
            throw new Error("student, subject, type e value são obrigatórios!")
        }
        const data = JSON.parse(await readFile(fileName));

        grade = {
            id: data.nextId++,
            student: grade.student,
            subject: grade.subject,
            type: grade.type,
            value: grade.value,
            timestamp: new Date()
        }
        data.grades.push(grade);

        await writeFile(fileName, JSON.stringify(data, null, 2));

        res.send(grade);
    } catch(err) {
        res.status(400).send({ error: err.message });
    }
});

/* Atividade 2 - Crie um endpoint para atualizar uma grade */ 
router.put("/", async (req, res) => {
    try {
        const grade = req.body;
        if(!grade.student || !grade.subject || !grade.type || grade.value == null) {
            throw new Error("student, subject, type e value são obrigatórios!")
        }
        
        const data = JSON.parse(await readFile(fileName));
        const index = data.grades.findIndex(g => g.id === grade.id);

        if(index === -1) {
            throw new Error("Registro não encontrado");
        };

        data.grades[index].student = grade.student;
        data.grades[index].subject = grade.subject;
        data.grades[index].type = grade.type;
        data.grades[index].value = grade.value;

        await writeFile(fileName, JSON.stringify(data, null, 2));
        res.send(grade);

    } catch(err) {
        res.status(400).send({ error: err.message });
    }
});

/*
router.get("/", async (req, res) => {
    try {
        const data = JSON.parse(await readFile(fileName));
        delete data.nextId;   //deleta o nextId p/ não aparecer na saída para o usuário
        res.send(data);

    } catch(err) {
        res.status(400).send({ error: err.message });
    }
});   */

/* Atividade 3 - Crie um endpoint para excluir uma grade */ 
router.delete("/:id", async (req, res) => {
    try {
        const data = JSON.parse(await readFile(fileName));
        data.grades = data.grades.filter(grade => grade.id !== parseInt(req.params.id));
        
        await writeFile(fileName, JSON.stringify(data, null, 2));
        res.end();
        
    } catch(err) {
        res.status(400).send({ error: err.message });
    }
})

/* Atividade 4 - Crie um endpoint para consultar uma grade em específico */ 
router.get("/:id", async(req, res) => {
    try {
        const data = JSON.parse(await readFile(fileName));
        const grade = data.grades.find(grade => grade.id === parseInt(req.params.id));
        res.send(grade);
    } catch(err) {
        res.status(400).send({ error: err.message });
    }
});

/* Atividade 5 - Crie um endpoint para consultar a nota total de um aluno em uma disciplina */ 
router.get("/nota", async (req, res) => {
    try {
        const data = JSON.parse(await readFile(fileName));
        const student = req.body.student;
        const subject = req.body.subject;
        let arrayNotas = [];
        
        if(!student || !subject) {
            throw new Error("student e subject são obrigatórios para obter a soma da nota na disciplina!")
        }
       
        arrayNotas = data.grades
        .filter(grade => grade.student == student && grade.subject == subject)
        .map(grade => grade.value )
        .reduce((previousValue, nextValue) => previousValue + nextValue); 
           
        res.send(`A soma total das notas do estudante ${student} na disciplina "${subject}" é ${arrayNotas}`);
    } catch(err) {
        res.status(400).send({ error: err.message });
    }
});

/* Atividade 6 - Crie um endpoint para consultar a média das grades de determinado subject e type */ 

router.get("/mediaSubjectType", async (req, res) => {
    try {
        const data = JSON.parse(await readFile(fileName));
        const type = req.body.type
        const subject = req.body.subject
        let count = 0;
        let arrayNotas = []

        if(!type || !subject) {
            throw new Error("type e subject são obrigatórios para obter a média!")
        }

        count = data.grades.filter(grade => grade.type == type && grade.subject == subject).length     

        arrayNotas = data.grades
        .filter(grade => grade.type == type && grade.subject == subject)
        .map(grade => grade.value)       
        .reduce((previousValue, nextValue) => previousValue + nextValue); 

        arrayNotas = arrayNotas / count;
        
        res.send(`A média das notas da disciplina "${subject}" com tipo ${type} é ${arrayNotas}`);

    } catch(err) {
        res.status(400).send({ error: err.message });
    }
})

/* Atividade 7 - Crie um endpoint para retornar as três melhores grades de acordo com determinado
subject e type */ 

router.get("/bestGrades", async (req, res) => {
    try {
        const data = JSON.parse(await readFile(fileName));
        const type = req.body.type
        const subject = req.body.subject
        let arrayNotas = [];
        let threeBestGrades = [];

        if(!type || !subject) {
            throw new Error("type e subject são obrigatórios para obter a média!")
        }

        arrayNotas = data.grades.filter(grade => grade.type == type && grade.subject == subject)
        .sort(function (a, b) {
            if(a.value > b.value) return 1;
            if(a.value < b.value) return -1;
            else return 0;
        })
      
        for(let i=0; i<3; i++) {
            threeBestGrades.push(arrayNotas.pop())
        }

        res.send(threeBestGrades);

    } catch(err) {
        res.status(400).send({ error: err.message });
    }
});

export default router;