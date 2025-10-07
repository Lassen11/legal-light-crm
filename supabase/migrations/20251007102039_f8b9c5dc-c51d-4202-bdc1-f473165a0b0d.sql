-- Создание таблицы сотрудников
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включение Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Политики доступа для всех операций
CREATE POLICY "Allow all operations on employees" 
ON public.employees 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Добавление столбца employee_id в таблицу tasks
ALTER TABLE public.tasks 
ADD COLUMN employee_id UUID REFERENCES public.employees(id);

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Вставка примеров сотрудников
INSERT INTO public.employees (name, email, phone, position) VALUES
  ('Иванов Александр', 'ivanov@example.com', '+7 (999) 111-11-11', 'Юрист'),
  ('Петрова Елена', 'petrova@example.com', '+7 (999) 222-22-22', 'Менеджер'),
  ('Сидоров Дмитрий', 'sidorov@example.com', '+7 (999) 333-33-33', 'Бухгалтер'),
  ('Козлова Анна', 'kozlova@example.com', '+7 (999) 444-44-44', 'Юрист'),
  ('Морозов Сергей', 'morozov@example.com', '+7 (999) 555-55-55', 'Менеджер');