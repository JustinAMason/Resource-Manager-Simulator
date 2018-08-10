# Resource Manager Simulator

## Background

During the Spring semester of 2016, I was a student at New York University's *Operating Systems* course instructed by Professor Allan Gottlieb. One assignment in the class involved creating a simulation of resource management. I received a perfect grade for the lab, which naturally led me to believe at the time that I was an excellent programmer: if I received a perfect grade, I must have written perfect code.

My recent work experience as an intern at *ROI Revolution* was a huge wake-up call: I was a great Computer Science student, but an inexperienced software engineer.

After realizing that I was at a Jon Snow-level of knowing nothing, I ended up abandoning my aspirations of becoming a software engineer altogether.

Just kidding. I geared much of my focus during my internship towards learning better practices of programmming, and read Sandi Metz's *Practical Object-Oriented Design in Ruby*.

I wanted to put this newfound wealth of knowledge to the test, and see just how much I have improved. Fortunately, I found a past lab assignment from *Operating Systems* that was a perfect candidate. For more information on the subject of the project itself, you can view the [original project repository here](https://github.com/JustinAMason/Operating-Systems-Labs/tree/master/Lab%2003%20(Banker's%20Algorithm)).

## Purpose

The lab itself was "perfect" in the sense that it achieved all of the results it was intended to. It passed over one-hundred tests that were used to evaluate the perfect grade. The end product was perfectly fine.

Changing the external behavior of the project is not the goal of this revisiting.

Instead, there are two primary goals:

- **Using newly-gained knowledge**. Now that I have had work experience and reading dedicated to the idea of object-oriented design considerations and best-coding practices, it was time to translate these new skills to concrete work.
- **Prove language flexibility**. The original program was written in Java. The book used as a guide to object-oriented design uses Ruby. I decided to re-create the project in JavaScript in order to demonstrate the ability to translate concepts into various languages

## Results

*Last updated July 29, 2018*

After doing some very-surface-level comparisons between the original Java program and the one found in this repository, I have come up with some very significant results.

The original project contained approximately 700 functionally-related lines of code. This refactoring cut that quantity down by approximately 25%.

One of the valuable concepts that I have learned is that functions should be small, concise, and do one thing. The adoption of this idea proved to be very apparent. The original project contained 24 unique functions. This refactoring, on the other hand, contains...125.

The reduction in function size, commonly an indicator of good design practice, is overwhelming. The original project contained a function that carried over 100 lines of code. The largest function in this refactoring pales in comparison, with just under 20 lines of code.

Perhaps the strongest indicator of this adoption is the average length of a function. The original project had an average of 29 lines per function. This refactoring? Four. This means that the average lines-of-code per function was reduced by over 85%!

Overall, I have been very satisfied with the results of this refactoring. However, I would like to add that there is a reason this section begins with a "last updated" section: no one design is perfect. It is entirely possible that I will revisit this project and continue to refactor further. In fact, I hope this is the case: I really hope that I have so much more to learn.

## Considerations

A core idea proposed by Sandi Metz is that design is important because the ability to change is important. You can thus reasonably argue that there is no reason to do this project with an emphasis on Agile-best practices: the project doesn't *need* to be easy to change because...it won't.

Refactoring this project was not done as though it felt like a necessity. It was important to me, however, because I found it as a great exercise to applying the valuable knowledge that I have obtained over a short period of time.
